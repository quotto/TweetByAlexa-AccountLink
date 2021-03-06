class Logger {
    constructor(){
    }
    write(msg,notice) {
            const dt = new Date()
            if(notice) {
                console.log(`${this.writetime()} [${notice}] ${msg}`)
            } else {
                console.log(`${this.writetime()} ${msg}`)
            }
        }

    writetime(){
        const dt = new Date()
        return `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()} -`
    }
}

module.exports = Logger
