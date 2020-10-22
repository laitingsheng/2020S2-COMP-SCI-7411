import { type } from "jquery";
import { Systeminformation as si } from "systeminformation";

import { ChartRecord } from "./handler";

export type LoadHandlerInput = si.CurrentLoadData;

export interface LoadHandlerCPUData {
    load: ChartRecord<si.CurrentLoadCpuData>;
    load_user: ChartRecord<si.CurrentLoadCpuData>;
    load_system: ChartRecord<si.CurrentLoadCpuData>;
    load_nice: ChartRecord<si.CurrentLoadCpuData>;
    load_idle: ChartRecord<si.CurrentLoadCpuData>;
    load_irq: ChartRecord<si.CurrentLoadCpuData>;
};

export interface LoadHandlerData {
    current: {
        avgload: ChartRecord<si.CurrentLoadData>;
        currentload: ChartRecord<si.CurrentLoadData>;
        currentload_user: ChartRecord<si.CurrentLoadData>;
        currentload_system: ChartRecord<si.CurrentLoadData>;
        currentload_nice: ChartRecord<si.CurrentLoadData>;
        currentload_idle: ChartRecord<si.CurrentLoadData>;
        currentload_irq: ChartRecord<si.CurrentLoadData>;
    };
    cpus: LoadHandlerCPUData[];
};

export type DiskHandlerInput = si.DisksIoData;

export interface DiskHandlerData {
    rIO: ChartRecord<si.DisksIoData>;
    rIO_sec: ChartRecord<si.DisksIoData>;
    wIO: ChartRecord<si.DisksIoData>;
    wIO_sec: ChartRecord<si.DisksIoData>;
    tIO: ChartRecord<si.DisksIoData>;
    tIO_sec: ChartRecord<si.DisksIoData>;
    ms: ChartRecord<si.DisksIoData>;
};

export type NetworkHandlerInput = si.NetworkInterfacesData[];

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

export type ProcessesHandlerInput = si.ProcessesData;

export type ProcessesDetails = si.ProcessesProcessData[];

export interface ProcessesHandlerData {
    all: ChartRecord<si.ProcessesData>;
    running: ChartRecord<si.ProcessesData>;
    blocked: ChartRecord<si.ProcessesData>;
    sleeping: ChartRecord<si.ProcessesData>;
    unknown: ChartRecord<si.ProcessesData>;
};
