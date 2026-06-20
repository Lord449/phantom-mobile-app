import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotifContextType {
  enabled: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  sendAlert: (title: string, body: string, data?: Record<string, string>) => Promise<void>;
  toggle: () => void;
}

const NotifContext = createContext<NotifContextType>({
  enabled: false,
  permissionGranted: false,
  requestPermission: async () => false,
  sendAlert: async () => {},
  toggle: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Notifications.getPermissionsAsync().then(({ status }) => {
      if (status === "granted") setPermissionGranted(true);
    });
    listenerRef.current = Notifications.addNotificationReceivedListener(() => {});
    return () => listenerRef.current?.remove();
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") return false;
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === "granted";
    setPermissionGranted(granted);
    if (granted) setEnabled(true);
    return granted;
  }, []);

  const sendAlert = useCallback(
    async (title: string, body: string, data?: Record<string, string>) => {
      if (!enabled || !permissionGranted || Platform.OS === "web") return;
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data: data ?? {}, sound: true },
        trigger: null,
      });
    },
    [enabled, permissionGranted]
  );

  const toggle = useCallback(() => {
    if (!permissionGranted) {
      requestPermission();
    } else {
      setEnabled((v) => !v);
    }
  }, [permissionGranted, requestPermission]);

  return (
    <NotifContext.Provider
      value={{ enabled, permissionGranted, requestPermission, sendAlert, toggle }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotifContext);
}
