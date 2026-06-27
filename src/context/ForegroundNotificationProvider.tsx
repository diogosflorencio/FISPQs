import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_COLORS } from '../config/theme';
import type { FcmNotificationType } from '../config/firebaseTopics';
import {
  setForegroundNotificationListener,
  type ForegroundNotificationPayload,
} from '../services/foregroundNotificationBus';

const AUTO_DISMISS_MS = 7000;

const TYPE_ICON: Record<FcmNotificationType, string> = {
  aviso: 'campaign',
  feedback: 'forum',
  doc: 'description',
  app: 'system-update',
};

function getIcon(type?: FcmNotificationType): string {
  if (type && type in TYPE_ICON) {
    return TYPE_ICON[type];
  }
  return 'notifications';
}

export const ForegroundNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const [notification, setNotification] = useState<ForegroundNotificationPayload | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const hideBanner = useCallback(() => {
    clearDismissTimer();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setNotification(null);
      }
    });
  }, [clearDismissTimer, opacity, translateY]);

  const showBanner = useCallback(
    (payload: ForegroundNotificationPayload) => {
      clearDismissTimer();
      setNotification(payload);
      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      dismissTimer.current = setTimeout(hideBanner, AUTO_DISMISS_MS);
    },
    [clearDismissTimer, hideBanner, opacity, translateY],
  );

  const handlePress = useCallback(() => {
    if (!notification) {
      return;
    }
    clearDismissTimer();
    notification.onPress?.();
    hideBanner();
  }, [clearDismissTimer, hideBanner, notification]);

  useEffect(() => {
    setForegroundNotificationListener(showBanner);
    return () => {
      setForegroundNotificationListener(null);
      clearDismissTimer();
    };
  }, [clearDismissTimer, showBanner]);

  return (
    <>
      {children}
      {notification ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrapper,
            {
              paddingTop: insets.top + 6,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Icon
              name={getIcon(notification.data?.type)}
              size={22}
              color={APP_COLORS.primary}
              style={styles.icon}
            />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {notification.body}
              </Text>
            </View>
            <TouchableOpacity
              onPress={hideBanner}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
              accessibilityLabel="Fechar notificação"
            >
              <Icon name="close" size={20} color={APP_COLORS.textMuted} />
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.primary,
    elevation: 4,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  cardPressed: {
    backgroundColor: APP_COLORS.surfaceMuted,
  },
  icon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    color: APP_COLORS.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
});
