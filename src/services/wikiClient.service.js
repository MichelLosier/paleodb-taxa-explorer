import {http} from './clientHelpers';

class WikiClientService{
    constructor(){
        this.baseWikiDataURL = 'https://query.wikidata.org/sparql?query='
        this.baseWikiURL = 'https://en.wikipedia.org/w/api.php'

        this.baseHeaders = {
            'Accept': 'application/json',
        }
    }

    baseRequest = (baseURL, params, headers) => {
        if (!headers) {
            headers = {}
        }
        const request = new Request(`${baseURL}${params}`, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers(Object.assign(this.baseHeaders, headers))
        })
        return http(request).then((data)=>{
            return data;
        }).then((data) => {
            return data.json();
        }).catch((error) => {
            console.log(error)
        })
    }

    getWikiHTMLByFossilWorksId = (id) => {
        return this.getWikiPageLinkByFossilWorksId(id)
        .then((data) => {
            return this.getWikiPageTitleFromSPARQLresponse(data)
        })
        .then((pageTitle)=>{
            if(!pageTitle){
                return "No Wiki Article"
            }
            return this.getWikiPageContentByTitle(pageTitle)
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

    getWikiPageContentByTitle = (pageTitle) => {
        const headers = {
            'Content-Type': 'application/json',
        }
        const params = `?action=query&titles=${pageTitle}&format=json&origin=*&prop=extracts&exintro=1`
        return this.baseRequest(this.baseWikiURL, params, headers)
    }
}

export default WikiClientService;