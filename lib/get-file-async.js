const fs = require("fs").promises;

module.exports = async (path) => {
    try {
        const data = await fs.readFile(path, "binary");
        let buffedData = new Buffer.from(data);
        return JSON.parse(buffedData.toString());
    } catch (err) {
        console.log(err)
    }
}