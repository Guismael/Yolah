import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { disconnectStyles as styles } from '../assets/Styles/styles';
import { useI18n } from '../context/useI18n';

interface DisconnectNoticeProps {
    visible: boolean;
    onReturnHome: () => void;
}

export default function DisconnectNotice({ visible, onReturnHome }: DisconnectNoticeProps) {
    const { t } = useI18n();
    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="auto">
            <View style={styles.card}>
                <Text style={styles.title}>{t('board.playerDisconnected')}</Text>
                <Text style={styles.body}>{t('board.playerLeft')}</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={onReturnHome}
                    accessibilityLabel={t('board.returnHome')}
                >
                    <Text style={styles.buttonText}>{t('board.returnHome')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

