import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GoldButton } from './ui/GoldButton';
import { AppDarkTheme, Spacing } from '../theme/theme';
import { AppIcon } from './ui/AppIcon';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught runtime error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <AppIcon name="alert-circle" size={64} color={AppDarkTheme.colors.error} />

                        <Text style={styles.title}>Something went wrong</Text>

                        <Text style={styles.subtitle}>
                            An unexpected error occurred. Please try again or restart the app.
                        </Text>

                        {/* Show error context only in dev/testing for safety */}
                        {__DEV__ && this.state.error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{this.state.error.message}</Text>
                            </View>
                        )}

                        <GoldButton
                            title="Try Again"
                            onPress={this.handleRetry}
                            style={styles.button}
                        />
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppDarkTheme.colors.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: AppDarkTheme.colors.onSurface,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: AppDarkTheme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 24,
    },
    errorBox: {
        backgroundColor: 'rgba(207, 102, 121, 0.1)',
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.xl,
        width: '100%',
    },
    errorText: {
        color: AppDarkTheme.colors.error,
        fontFamily: 'monospace',
        fontSize: 12,
    },
    button: {
        minWidth: 200,
    },
});
