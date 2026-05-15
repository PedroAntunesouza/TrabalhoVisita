import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_HEIGHT = 140;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  // state to control whether scrolling is allowed based on content height
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleLayout = (evt: any) => {
    setContainerHeight(evt.nativeEvent.layout.height);
  };

  const handleContentSizeChange = (_w: number, h: number) => {
    setContentHeight(h);
  };

  // recompute scrollEnabled whenever relevant values change
  useEffect(() => {
    if (keyboardVisible) {
      setScrollEnabled(true);
    } else {
      setScrollEnabled(contentHeight > containerHeight);
    }
  }, [keyboardVisible, contentHeight, containerHeight]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor: '#121212', flex: 1 }}
      scrollEventThrottle={16}
      // prevent endless bouncing/overscroll at bottom
      bounces={false}
      overScrollMode="never"
      contentContainerStyle={{ flexGrow: 1 }}
      scrollEnabled={scrollEnabled}
      onLayout={handleLayout}
      onContentSizeChange={handleContentSizeChange}>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={[styles.content, { backgroundColor: '#121212' }]}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    // flex:1 removed to avoid forcing extra height inside ScrollView
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
});
