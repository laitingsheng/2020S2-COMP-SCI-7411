import { Systeminformation as si } from "systeminformation";

import { ChartRecord } from "./handler";

export type DiskHandlerInput = si.DisksIoData;

export interface DiskHandlerData {
    rIO: ChartRecord<si.DisksIoData>;
    rIO_sec: ChartRecord<si.DisksIoData>;
    wIO: ChartRecord<si.DisksIoData>;
    wIO_sec: ChartRecord<si.DisksIoData>;
    tIO: ChartRecord<si.DisksIoData>;
    tIO_sec: ChartRecord<si.DisksIoData>;
    ms: ChartRecord<si.DisksIoData>;
}

export type NetworkHandlerInput = Array<si.NetworkInterfacesData>;

export interface NetworkHandlerData {
    rx_bytes: ChartRecord<si.NetworkInterfacesData>;
    tx_bytes: ChartRecord<si.NetworkInterfacesData>;
    rx_dropped: ChartRecord<si.NetworkInterfacesData>;
    tx_dropped: ChartRecord<si.NetworkInterfacesData>;
    rx_errors: ChartRecord<si.NetworkInterfacesData>;
    tx_errors: ChartRecord<si.NetworkInterfacesData>;
    rx_sec: ChartRecord<si.NetworkInterfacesData>;
    tx_sec: ChartRecord<si.NetworkInterfacesData>;
    ms: ChartRecord<si.NetworkInterfacesData>;
};
