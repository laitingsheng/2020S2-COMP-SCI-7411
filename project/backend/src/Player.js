export default class Player {
    invisible = 0;
    invincible = 0;
    stunned = 0;

    /**
     * @param {string} id
     * @param {[number, number]} position
     * @param {boolean} it
     */
    constructor(id, position, it) {
        this.id = id;
        this.position = position;
        this.it = it;
    }
}
