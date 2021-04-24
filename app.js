// DOM REFERENCES
window.search = document.getElementById('search')
const app = document.getElementById('app')
const searchHistory = document.getElementById('search-history')


// STATE
window.state = {
    offset: 0,
    results: [],
    loading: false,
    error: null,
    history: [
        'Call(Name("len"))',
        'BinOp(op=Add() | Sub())',
        'Return(Tuple())',
        'FunctionDef(f"run_%")',
        'Tuple([Constant(), Constant()])',
        'FunctionDef(body=[*..., Return(Call())])',
    ],
    urlParams: new URLSearchParams(window.location.search)
};

function setState(data) {
    window.state = {...window.state, ...data}

    window.state.urlParams.set('query', window.search.value)
    window.state.urlParams.set('offset', window.state.offset)
    window.history.pushState({
        query: window.search.value,
        offset: window.state.offset
    }, '', '/?' + window.state.urlParams.toString())

    render()
}


// COMPONENTS
async function render() {
    const noResultsFound = state.results.length === 0
                        && state.history.length === 0
                        && state.loading === false
                        && state.error === null

    results.innerHTML = `
        ${state.results.map(CodeComponent).join('')}
        ${state.results.length === 10 ? `<button id="next-button" onclick="nextPage()">Next</button>` : ''}
        ${noResultsFound ? `<p style="text-align: center">No Results Found...</p>` : ''}
        ${state.loading ? '<p align="center"><img id="loading" src="loading.png"/></p>' : '' }
        ${state.error ? `<p id="error">${state.error}</p>` : '' }
    `

    searchHistory.innerHTML = state.history.map(HistoryComponent).join('')

    document.querySelectorAll(".hljs").forEach(hljs.highlightBlock)
}

function CodeComponent({ repo, username, github_link, filename, source }) {
    return `
        <fieldset>
            <legend>
                <a href=${repo}>
                    <img src="https://avatars.githubusercontent.com/${username}" width=40 height=40/>
                </a>
                <a href="${github_link}">
                    ${filename}
                </a>
            </legend>
            <pre style="max-width: 650px; overflow-x: auto">
                <code class="python hljs">${source}</code>
            </pre>
        </fieldset>
    `
}

function HistoryComponent(data) {
    return `
        <li onclick="(search.value = this.innerText) && (window.state.history = []) && fetchQuery()">
            <span class="text"><a>${data}</a></span>
        </li>
    `
}


// EVENT HANDLERS
async function fetchQuery() {
    setState({ results: [], loading: true })

    const response = await fetch(`http://localhost:8000/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: search.value,
            offset: window.state.offset
        })
    });

    const {results, exception} = await response.json();
    setState({
        results,
        error: exception,
        loading: false,
        history: []
    })
}

function nextPage() {
    window.state.offset += window.state.results.length;
    window.scrollTo(0, 0)
    fetchQuery()
}


// entry point
(async function () {
    const [query, offset] = [
        window.state.urlParams.get('query'),
        +window.state.urlParams.get('offset') || 0
    ]

    if (query) {
        window.search.value = query
        setState({ offset, history: [] })
        fetchQuery().then(render)
    } else {
        render()
    }
})()
