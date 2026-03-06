import { ProtocolRegistry } from '../services/ProtocolRegistry';
import { ProtocolType } from '../types/protocol';

describe('ProtocolRegistry', () => {
    let registry: ProtocolRegistry;

    beforeEach(() => {
        registry = new ProtocolRegistry();
    });

    describe('getAllServiceUUIDs()', () => {
        it('returns deduplicated service UUIDs', () => {
            const uuids = registry.getAllServiceUUIDs();
            expect(uuids.length).toBeGreaterThan(0);
            // FTMS service
            expect(uuids).toContain('00001826-0000-1000-8000-00805f9b34fb');
            // Delightech/Fitshow share FFF0
            expect(uuids).toContain('0000fff0-0000-1000-8000-00805f9b34fb');
        });
    });

    describe('getProbeCommands()', () => {
        it('returns probe commands for protocols that support them', () => {
            const probes = registry.getProbeCommands();
            // FTMS and Delightech support REQUEST_CONTROL/CONNECT.
            // Fitshow does not implement CONNECT, so it returns [] and is omitted.
            expect(probes.length).toBe(2);

            const ftmsProbe = probes.find(p => p.protocol.type === ProtocolType.FTMS);
            expect(ftmsProbe).toBeDefined();
            expect(ftmsProbe?.data).toEqual(new Uint8Array([0x00])); // REQUEST_CONTROL

            const delightechProbe = probes.find(p => p.protocol.type === ProtocolType.DELIGHTECH);
            expect(delightechProbe).toBeDefined();
            expect(delightechProbe?.data[0]).toBe(0x40); // CMD_INFO base
        });
    });

    describe('identifyFromResponse()', () => {
        it('correctly identifies FTMS from a Bike characteristic UUID', () => {
            const data = new Uint8Array([0x01, 0x02]);
            const protocol = registry.identifyFromResponse(data, '00002ad2-0000-1000-8000-00805f9b34fb');
            expect(protocol?.type).toBe(ProtocolType.FTMS);
        });

        it('correctly identifies Delightech from a 0x40-prefixed response on FFF1', () => {
            const data = new Uint8Array([0x40, 0x00]);
            const protocol = registry.identifyFromResponse(data, '0000fff1-0000-1000-8000-00805f9b34fb');
            expect(protocol?.type).toBe(ProtocolType.DELIGHTECH);
        });

        it('correctly identifies Fitshow from a [0x02, 0x42]-prefixed response on FFF1', () => {
            const data = new Uint8Array([0x02, 0x42, 0x00]);
            const protocol = registry.identifyFromResponse(data, '0000fff1-0000-1000-8000-00805f9b34fb');
            expect(protocol?.type).toBe(ProtocolType.FITSHOW);
        });

        it('returns null for unknown data', () => {
            const data = new Uint8Array([0x99, 0x99]);
            const protocol = registry.identifyFromResponse(data, '0000ffe1-0000-1000-8000-00805f9b34fb');
            expect(protocol).toBeNull();
        });
    });
});
