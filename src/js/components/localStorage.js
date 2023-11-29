// expTime is minute
class LocalStorage {
    set(name, value, expTime) {
        const option = {
            expTime: new Date().getTime() + expTime * 60 * 1000,
        };
        window.localStorage.setItem(name, JSON.stringify({ value, option }));
    }

    get(name) {
        const ls = window.localStorage.getItem(name);
        const lsParse = JSON.parse(ls);
        if (!lsParse) return null;
        if (this.compareTime(lsParse.option.expTime)) {
            window.localStorage.removeItem(name);
            return null;
        }
        return lsParse.value;
    }

    remove(name) {
        window.localStorage.removeItem(name);
    }

    compareTime(expTime) {
        return expTime < new Date().getTime();
    }
}

export default new LocalStorage();
