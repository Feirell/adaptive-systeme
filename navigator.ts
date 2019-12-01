(() => {
    const navTo = [
        ["./tsp.html", "Traveling Salesman Problem"],
        ["./particleswarm.html", "Partikelschwarm optimierung"]
    ];

    const navElem = document.createElement('nav');

    const locURL = new URL(window.location.href);

    for (const nav of navTo) {
        const link = document.createElement('a');
        link.innerText = nav[1];
        link.setAttribute('href', nav[0]);
        const isCurrentWebsite = new URL(link.href, locURL).pathname == locURL.pathname;

        if (isCurrentWebsite)
            link.setAttribute('class', 'is-current');
        navElem.appendChild(link);
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.body.prepend(navElem);
    });
})()