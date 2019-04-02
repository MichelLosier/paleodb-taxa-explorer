import React from 'react';
import PropTypes from 'prop-types';

class WikiArticle extends React.Component{
    constructor(){
        super()
        this.state = {
            articleHTML:'',
        }
    }

    componentDidMount(){   
        this.fetchArticle(this.props.taxonId)
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.taxonId != this.props.taxonId){
            this.fetchArticle(nextProps.taxonId)
        }
    }

    fetchArticle = (taxonId) => {
        const {wikiClient} = this.props

        if(taxonId){
            const fossilWorksId = taxonId.split(':')[1]
            wikiClient.getWikiHTMLByFossilWorksId(fossilWorksId).then((html) => {
                this.setState({articleHTML: html});
            })
        }
    }

    render(){
        const {articleHTML} = this.state
        return(
            <div className="wiki-article">
                {articleHTML}
            </div>
        )
    }
}

export default WikiArticle;