import {http} from './clientHelpers';


class PaleodbClientService{
    constructor(){
        this.baseTaxaURL = 'https://training.paleobiodb.org/data1.2/taxa/list.json'
        this.baseConfigURL = 'https://training.paleobiodb.org/data1.2/config.json'
    
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
            return data;
        })
    }

    // https://training.paleobiodb.org/data1.2/taxa/list_doc.html
    // @rank int
    getAllTaxaByRank = (rank) => {
        return this.baseRequest(`all_taxa&rank=${rank}`);
    }

    getTaxaByOID = (oid) => {
        return this.baseRequest(`taxon_id=${oid}`);
    }

    getTaxaParent = (oid) => {
        return this.baseRequest(`taxon_id=${oid}&rel=parent`);
    }

    getTaxaAllParents = (oid, depth) => {
        return this.baseRequest(`taxon_id=${oid}&rel=all_parents&depth=${depth}`);
    }

    getTaxaChildren = (oid) => {
        return this.baseRequest(`taxon_id=${oid}&rel=children`);
    }

    getTaxaAllChildren = (oid, depth) => {
        return this.baseRequest(`taxon_id=${oid}&rel=all_children&depth=${depth}`);
    }

    // https://training.paleobiodb.org/data1.2/general/taxon_names_doc.html
    getTaxaByNameMatch = (name) => {
        return this.baseRequest(`match_name=${name}.`);
    }

}

export default PaleodbClientService;