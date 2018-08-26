export const http = (request) => {
    return fetch(request).then((response) => {
        if(response.ok){
            return response.json();
        }
        throw new Error(`Request unsuccessful: ${response.status}, ${response.statusText}`)
    }).then((data) => {
        return data;
    })
    .catch((err) => {
        return console.log(err);
    })
}