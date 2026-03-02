// ============================================================
// services/ProtocolRegistry.ts — Protocol identification race
// ============================================================
//
// Manages registered protocol strategies and runs the
// "Identification Race" to determine which protocol a
// connected device speaks.
// ============================================================

import { IProtocol } from '../types/protocol';
import { FtmsStrategy } from '../protocols/FtmsStrategy';
import { DelightechStrategy } from '../protocols/DelightechStrategy';
import { FitshowStrategy } from '../protocols/FitshowStrategy';

export class ProtocolRegistry {
    private protocols: IProtocol[] = [];

    constructor() {
        // Register all known protocols in priority order
        this.register(new FtmsStrategy());
        this.register(new DelightechStrategy());
        this.register(new FitshowStrategy());
    }

    /**
     * Register a protocol strategy.
     */
    register(protocol: IProtocol): void {
        this.protocols.push(protocol);
    }

    /**
     * Get all registered protocols.
     */
    getAll(): IProtocol[] {
        return [...this.protocols];
    }

    /**
     * Get all unique service UUIDs to scan for across all protocols.
     */
    getAllServiceUUIDs(): string[] {
        const uuids = new Set<string>();
        for (const protocol of this.protocols) {
            for (const uuid of protocol.serviceUUIDs) {
                uuids.add(uuid);
            }
        }
        return Array.from(uuids);
    }

    /**
     * Get all characteristic UUIDs that should be subscribed to
     * during the identification phase (notify chars from all protocols).
     */
    getAllNotifyCharUUIDs(): string[] {
        const uuids = new Set<string>();
        for (const protocol of this.protocols) {
            for (const uuid of protocol.notifyCharUUIDs) {
                uuids.add(uuid);
            }
        }
        return Array.from(uuids);
    }

    /**
     * Run the identification race.
     * Given a BLE notification payload and the characteristic it arrived on,
     * return the first protocol whose identify() returns true.
     */
    identifyFromResponse(
        data: Uint8Array,
        characteristicUUID: string
    ): IProtocol | null {
        for (const protocol of this.protocols) {
            if (protocol.identify(data, characteristicUUID)) {
                return protocol;
            }
        }
        return null;
    }

    /**
     * Get the probe commands to send during identification.
     * Each probe targets a specific protocol's write characteristic.
     *
     * Returns an array of { serviceUUID, charUUID, data } objects
     * that the DeviceSession should write via the BluetoothManager.
     */
    getProbeCommands(): Array<{
        protocol: IProtocol;
        serviceUUID: string;
        charUUID: string;
        data: Uint8Array;
    }> {
        const probes: Array<{
            protocol: IProtocol;
            serviceUUID: string;
            charUUID: string;
            data: Uint8Array;
        }> = [];

        for (const protocol of this.protocols) {
            const commands = protocol.getCommand(
                // FTMS uses REQUEST_CONTROL (0x00), others use CONNECT (0x40 for Delightech)
                protocol.type === 'FTMS' ? 'REQUEST_CONTROL' as any : 'CONNECT' as any
            );

            if (commands.length > 0 && protocol.writeCharUUIDs.length > 0) {
                probes.push({
                    protocol,
                    serviceUUID: protocol.serviceUUIDs[0],
                    charUUID: protocol.writeCharUUIDs[0],
                    data: commands[0],
                });
            }
        }

        return probes;
    }
}
