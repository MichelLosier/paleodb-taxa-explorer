import {http} from './clientHelpers';

class WikiClientService{
    constructor(){
        this.baseWikiDataURL = 'https://query.wikidata.org/sparql?query='
        this.baseWikiURL = 'https://en.wikipedia.org/api/rest_v1/'

        this.baseHeaders = new Headers({
            'Accept': 'application/json'
        })
    }

    baseRequest = (baseURL, params) => {
        const request = new Request(`${baseURL}${params}`, {
            method: 'GET',
            headers: this.baseHeaders
        })
        return http(request).then((data)=>{
            return data;
        })
    }

    getWikiHTMLByFossilWorksId = (id) => {
        return this.getWikiPageLinkByFossilWorksId(id)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            return this.getWikiPageTitleFromSPARQLresponse(data)
        })
        .then((pageTitle)=>{
            if(!pageTitle){
                return "No Wiki Article"
            }
            return this.getWikiPageHTMLByTitle(pageTitle)
        })
    }

    getWikiPageLinkByFossilWorksId = (id) => {
        const sparqlQuery = `SELECT * WHERE {
            ?fossilworks_id wdt:P842 "${id}".
            OPTIONAL {
              ?article schema:about ?fossilworks_id .
              ?article schema:inLanguage "en" .
              ?article schema:isPartOf <https://en.wikipedia.org/> .
            }
          }`
        return this.baseRequest(this.baseWikiDataURL, `${encodeURIComponent(sparqlQuery)}`)
    }

    //provide full json
    getWikiPageTitleFromSPARQLresponse = (data) => {
        if(!data.results.bindings[0].article){
            return false
        }
        const uri = data.results.bindings[0].article.value
        const lastSegment = uri.lastIndexOf("/")

        return uri.substring(lastSegment+1)
    }

    getWikiPageHTMLByTitle = (pageTitle) => {
        const endpoint = `page/html/${pageTitle}`
       return this.baseRequest(this.baseWikiURL, endpoint)
        .then((response) => {
            return response.text()
        })
    }

}

export default WikiClientService;