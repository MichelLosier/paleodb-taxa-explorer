export class Taxa {
    constructor(_id, name, rank, parent, img){
        const imgURL = `https://paleobiodb.org/data1.2/taxa/thumb.png?id=`;

        this._id = _id
        this.name = name
        this.rank = rank
        this.parent = parent
        this.children = [],
        this.img = `${imgURL}${img.split(':')[1]}`
        this.show = true;
    }
}

export function taxaFactory(records){
    if (Array.isArray(records)) {
        return records.map((record) => {
            return new Taxa(record.oid, record.nam, record.rnk, record.par, record.img);
        })
    } else if (records.oid) {
        return new Taxa(records.oid, records.nam, records.rnk, records.par, records.img);
    }
    return;
}