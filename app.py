from flask import Flask, request, url_for
import requests, json
app = Flask(__name__)
TOKEN = open('token').readline()


class NavitiaRequest:
    navitia_token = TOKEN
    base_url = "http://api.navitia.io/"
    base_url_region = base_url+"v1/coverage/{}"

    @classmethod
    def get(cls, region, api, parameters):
        headers = {'Authorization' : cls.navitia_token}
        url = cls.base_url_region.format(region)
        url += "/{}"
        url = url.format(api)
        print url
        return requests.get(url, params=parameters, headers=headers)

@app.route('/places')
def places():
    query = request.args.get("q")
    req_ = NavitiaRequest.get("fr-idf", "places",
            parameters={"q": query})

    if req_.status_code == 200:
        names = map(lambda a: {"name": a["name"], "id": a["id"]}, req_.json()['places'])
        return json.dumps(names, indent=4, separators=(',', ': '))
    return '[]'


@app.route('/journeys')
def journeys():
    from_ = request.args.get('from')
    to_ = request.args.get('to')
    req_ = NavitiaRequest.get("fr-idf", "journeys",
            parameters={"from":from_, "to": to_})
    if req_.status_code == 200:
        return json.dumps(req_.json()['journeys'][0]['sections'], indent=4, separators=(',', ': '))
    return '{"suggestion":[]}'+str(req_.status_code)

@app.route('/')
@app.route('/index.html')
def root():
    return app.send_static_file('index.html')

@app.route('/map.html')
def map_route():
    return app.send_static_file('map.html')

import os
@app.route('/js/<path:path>')
def static_proxy(path):
    # send_static_file will guess the correct MIME type
    return app.send_static_file(os.path.join('js', path))

if __name__ == '__main__':
    app.debug = True
    app.run()
