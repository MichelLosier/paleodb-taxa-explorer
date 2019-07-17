import {http} from './clientHelpers';


class PaleodbClientService{
    constructor(){
        this.baseTaxaURL = 'https://paleobiodb.org/data1.2/taxa/list.json'
        this.baseConfigURL = 'https://paleobiodb.org/data1.2/config.json'
    
        this.baseGetHeaders = new Headers({
            'Content-Type': 'application/json'
        })
    }

    baseRequest = (params) => {
        const request = new Request(`${this.baseTaxaURL}?${params}`, {
            method: 'GET',
           // headers: this.baseGetHeaders
        })
        return http(request).then((data)=>{
            return data.json();
        })
    }

    // https://training.paleobiodb.org/data1.2/taxa/list_doc.html
    // @rank int
    getAllTaxaByRank = (rank) => {
        return this.baseRequest(`all_taxa&rank=${rank}&show=img`);
    }

    getTaxaByOID = (oid) => {
        return this.baseRequest(`taxon_id=${oid}&show=img`);
    }

    getTaxaParent = (oid) => {
        return this.baseRequest(`taxon_id=${oid}&rel=parent&show=img`);
    }

    getTaxaAllParents = (oid, depth) => {
        return this.baseRequest(`taxon_id=${oid}&rel=all_parents&depth=${depth}&show=img`);
    }

    getTaxaChildren = (oid) => {
        return this.baseRequest(`taxon_id=${oid}&rel=children&show=img`);
    }

    getTaxaAllChildren = (oid, depth) => {
        return this.baseRequest(`taxon_id=${oid}&rel=all_children&depth=${depth}&show=img`);
    }

    // https://training.paleobiodb.org/data1.2/general/taxon_names_doc.html
    getTaxaByNameMatch = (name, limit) => {
        return this.baseRequest(`match_name=${name}.&limit=${limit}&show=img`);
    }

}

export default PaleodbClientService;