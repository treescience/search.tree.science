const stats_box = document.getElementById("stats");
const inspect = document.getElementById("inspect");
const searchHistory = document.getElementById("search-history");
const search = document.getElementById("reizql_query");
const search = document.getElementById('search')
const app = document.getElementById('app')


// STATE
let state = {
	offset: 0,
	results: []
	urlParams: new URLSearchParams(window.location.search)
};

function setState(data) {
	state = {...state, ...data}
	render()
}

const postForm = (endpoint, body) => {
    return fetch(`//api.tree.science${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body,
    });
};


// COMPONENTS
function render() {
	app.innerHTML = `

	`

	return `
		${state.results.map(CodeComponent).join('')}
	`
    if (data.status == "success") {
        if (data.results.length === 0) {
            document.getElementById("errors").innerHTML = "No results found!";
        }
        for (result of data.results) {
            let container = document.createElement("fieldset");
            let filename_box = document.createElement("legend");
            let filename_link = document.createElement("a");
            filename_link.setAttribute('href', result.github_link);
            filename_link.appendChild(document.createTextNode(result.filename));

            filename_box.appendChild(filename_link);
            container.appendChild(filename_box);

            let outer_code_box = document.createElement("pre");
            let inner_code_box = document.createElement("code");
            inner_code_box.className = "python hljs";

            let code_box = document.createTextNode(result.source);
            inner_code_box.appendChild(code_box);
            outer_code_box.appendChild(inner_code_box);
            container.appendChild(outer_code_box);

            document.getElementById("results").appendChild(container);
        }

        document.querySelectorAll("code").forEach((block) => {
            hljs.highlightBlock(block);
        });
    } else {
        document.getElementById("errors").innerHTML = data.exception;
    }

    offset += 10
}

function CodeComponent({ link, fpath, code }) {
	return `
		<fieldset>
			<legend>
				<a href="${link}">
					${fpath}
				</a>
			</legend>
			<pre>
				<code class="python hljs">
					${code}
				</code>
			</pre>
		</fieldset>
	`
}

// EVENT HANDLERS
async function fetchData() {
    const body = JSON.stringify({
	    query: search,
	    offset
    });

    const response = await fetch(`//api.tree.science${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
	body: JSON.stringify({
		query: search.value,
		offset: state.offset
	})
    });

    const results = await res.json();
    setState({ results })
}
