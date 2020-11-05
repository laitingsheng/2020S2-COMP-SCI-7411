interface RemotePlayer {
    id: string,
    position: [number, number],
    it: boolean,
    invisible: number,
    invincible: number,
    stunned: number
}

interface CapsuleProperty {
    cd: number;
    position: [number, number]
}

interface RemoteWorld {
    size: number,
    players: RemotePlayer[],
    yellow: CapsuleProperty,
    black: CapsuleProperty
}
