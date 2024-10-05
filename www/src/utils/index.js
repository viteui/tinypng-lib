
export function getSizeTrans(fs) {
    if (fs < 1024) {
        return String(fs)
    } else if (fs < 1024 * 1024) {
        return parseInt(String((fs * 10) / 1024)) / 10 + 'K'
    } else if (fs < 1024 * 1024 * 1024) {
        return parseInt(String((fs * 10) / 1024 / 1024)) / 10 + 'M'
    } else {
        return parseInt(String((fs * 10) / 1024 / 1024 / 1024)) / 10 + 'G'
    }
}
export default {}