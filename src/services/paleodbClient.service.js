import {http} from './clientHelpers';

const baseTaxaURL = 'https://training.paleobiodb.org/data1.2/taxa/list.json'
const baseConfigURL = 'https://training.paleobiodb.org/data1.2/config.json'

const baseGetHeaders = new Headers({
    'Content-Type': 'application/json'
})

const baseRequest = (params) => {
    const request = new Request(`${baseTaxaURL}?${params}`, {
        method: 'GET',
        headers = baseGetHeaders
    })
    return http(request).then((data)=>{
        return data;
    })
}

// https://training.paleobiodb.org/data1.2/taxa/list_doc.html

// @rank int
export const getAllTaxaByRank = (rank) => {
    return baseRequest(`all_taxa&rank=${rank}`);
}

export const getTaxaByOID = (oid) => {
    return baseRequest(`taxon_id=${oid}`);
}

export const getTaxaParent = (oid) => {
    return baseRequest(`taxon_id=${oid}&rel=parent`);
}

export const getTaxaAllParents = (oid, depth) => {
    return baseRequest(`taxon_id=${oid}&rel=all_parents&depth=${depth}`);
}

export const getTaxaChildren = (oid) => {
    return baseRequest(`taxon_id=${oid}&rel=children`);
}

export const getTaxaAllChildren = (oid, depth) => {
    return baseRequest(`taxon_id=${oid}&rel=all_children&depth=${depth}`);
}

// https://training.paleobiodb.org/data1.2/general/taxon_names_doc.html
const getTaxaByNameMatch = (name) => {
    return baseRequest(`match_name=${name}.`);
}