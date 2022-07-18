const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let create=(filename,hedaz,data)=>{
    const csvWriter = createCsvWriter({ path: `./${filename}.csv`,header: hedaz });
    const records = data;
    csvWriter.writeRecords(records).then(() => { return true; });
}

module.exports={create}