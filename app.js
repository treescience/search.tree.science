let stats_box = document.getElementById("stats");
let form = document.forms.fetch;
let inspect = document.getElementById("inspect");
let searchHistory = document.getElementById("search-history");
let reizql = document.getElementById("reizql_query");

let urlParams = new URLSearchParams(window.location.search);

const show = (element) => element.style.display = "block";
const hide = (element) => element.style.display = "none";

const setState = (query, inspect) => {
    urlParams.set("query", query);
    if (inspect !== undefined){
        urlParams.set("inspect", inspect);
    }
    window.history.pushState({query: query, inspect: inspect || false}, '', `/?${urlParams.toString()}`);
};

const queryChange = (e) => e.target.value ? show(inspect) : hide(inspect);

const basic_reset = () => {
    document.getElementById("wrapper").style.paddingTop = "0";
    hide(document.getElementById("search-history"));
    show(document.getElementById("stats-wrapper"));
    show(document.getElementById("result-wrapper"));

    stats_box.innerHTML.innerHTML = "";
    
    document.getElementById("stats").innerHTML = "";
    document.getElementById("errors").innerHTML = "";
    document.getElementById("results").innerHTML = "";
    document.getElementById("json-renderer").innerHTML = "";
};

const handleHistory = async (e) => {
    if (e?.target?.text) {
        const query  = e.target.text;
        document.getElementById("reizql_query").value = query;
        await makeQuery(query);
    }
};

const inspectQuery = async (e) => {
    if (e !== undefined) {
        e.preventDefault()
    }

    const query = document.getElementById("reizql_query").value;
    const body = JSON.stringify({
        query: query
    });

    hide(inspect);
    setState(query, true);
    basic_reset();

    const res = await postForm("/analyze", body);
    const data = await res.json();
    
    let jsonView = document.getElementById("json-renderer");
    jsonView.appendChild(document.createTextNode(JSON.stringify(data, null, 2)));
    hljs.highlightBlock(jsonView);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    await makeQuery(e.target.firstElementChild.value);
};

const makeQuery = async (query) => {
    show(inspect);
    basic_reset();
    setState(query);

    const body = JSON.stringify({
        query: query,
    });

    const res = await postForm("/query", body);
    const data = await res.json();

    if (data.status == "success") {
        for (result of data.results) {
            let container = document.createElement("fieldset");
            let filename_box = document.createElement("legend");
            filename_box.innerHTML = result.filename;
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
};

const postForm = (endpoint, body) => {
    return fetch(`https://api.tree.science${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body,
    });
};

inspect.addEventListener("click", inspectQuery);
searchHistory.addEventListener("click", handleHistory);
form.addEventListener("submit", handleSubmit);
reizql.addEventListener("input", queryChange);

(async () => {
    const query = urlParams.get("query");
    if (query !== null) {
        reizql.value = query;
        if (urlParams.get("inspect") !== null) {
            return await inspectQuery();
        }
        await makeQuery(query);
    } else{
        hide(inspect);
    }
}
)();
