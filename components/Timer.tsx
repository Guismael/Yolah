import { useEffect, useState, useRef } from "react";
import { Animated, Text, Easing, View } from "react-native";
import { timerStyles as styles } from '../assets/Styles/styles';

type Props = {
  start: boolean;
  duration: number;
  onTick?: (t: number) => void;
  onFinish?: () => void;
};

export default function Timer({ start, duration, onFinish,onTick }: Props) {
  const [time, setTime] = useState(duration);

  //  Reset du timer quand la durée change (choix 30s/1m/etc)
  useEffect(() => {
    setTime(duration);
  }, [duration]);

  // w Animation (zoom pulse)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  //  Décompte + animation dans les dernières secondes
  useEffect(() => {
    if (!start) return;

    if (time === 0) {
      onFinish && onFinish();
      return;
    }

    // si reste 5 secondes → pulse()
    if (time <= 5) {
      pulse();
    }

    const id = setInterval(() => {
      setTime((t) => {
      const newTime = t - 1;
      onTick && onTick(newTime);
  return newTime;
});

    }, 1000);

    return () => clearInterval(id);
  }, [start, time]);

  return (
    <View style={[styles.container, time <= 5 && styles.warning]}>
      <Animated.Text
        style={[
          styles.timer,
          {
            transform: [{ scale: scaleAnim }],
            color: time <= 5 ? "#ff3b30" : "#153B4A",
          },
        ]}
      >
        {String(time).padStart(2, "0")}
      </Animated.Text>
    </View>
  );
}

