from flask import Flask, render_template, request, jsonify
import pymysql
import pandas as pd
import numpy as np
import json
from py2neo import Graph, Node, Relationship, NodeMatcher
from py2neo.matching import RelationshipMatcher

app = Flask(__name__)

NEO4J_URL = "http://localhost:7474"
NEO4J_AUTH = ("换成自己的user", "换成自己的password")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


def build_graph_data(keyword, limit=5):
    graph = Graph(NEO4J_URL, auth=NEO4J_AUTH)
    graph_rows = graph.run(
        """
        MATCH (root)
        WHERE toLower(root.name) CONTAINS toLower($keyword)
        WITH root LIMIT 1
        OPTIONAL MATCH (root)-[r1]-(branch)
        WITH root, collect(DISTINCT {
            node: branch,
            rel: type(r1),
            labels: labels(branch)
        })[..5] AS branches
        UNWIND CASE WHEN size(branches) = 0 THEN [null] ELSE branches END AS branchItem
        WITH root, branchItem, branchItem.node AS branchNode
        OPTIONAL MATCH (branchNode)-[r2]-(leaf)
        WHERE leaf IS NULL OR leaf <> root
        WITH root, labels(root) AS rootLabels, branchItem,
             collect(DISTINCT {
                 node: leaf,
                 rel: type(r2),
                 labels: labels(leaf)
             })[..3] AS leaves
        RETURN root, rootLabels, collect({
            branch: branchItem,
            leaves: leaves
        }) AS rows
        """,
        keyword=keyword
    ).data()

    def node_props(node):
        if not node:
            return {}
        return dict(node)

    def node_id(node, prefix):
        identity = getattr(node, "identity", None)
        return "{}_{}".format(prefix, identity if identity is not None else abs(hash(str(node))))

    def first_label(labels, default="Keyword"):
        return labels[0] if labels else default

    def add_category(categories, label, colors):
        if label not in categories:
            color = colors[len(categories) % len(colors)]
            categories[label] = {
                "name": label,
                "itemStyle": {"color": color, "normal": {"color": color}},
                "color": color
            }
        return list(categories.keys()).index(label)

    def format_node(node, name, label, category, symbol_size, color):
        props = node_props(node)
        department = props.get("cure_department") or [""]
        if isinstance(department, str):
            department = [department]
        return {
            "id": node_id(node, "node") if node else "keyword_root",
            "name": name,
            "prevent": props.get("prevent", ""),
            "curelasttime": props.get("cure_lasttime", ""),
            "department": department[0] if department else "",
            "cause": props.get("cause", ""),
            "des": props.get("desc", ""),
            "easyget": props.get("easy_get", ""),
            "symbolSize": symbol_size,
            "category": category,
            "labelName": label,
            "itemStyle": {"color": color}
        }

    colors = ["#7C3AED", "#0EA5A4", "#F59E0B", "#EF4444", "#2563EB", "#16A34A", "#DB2777", "#64748B"]
    categories_map = {}
    data = []
    links = []
    seen_nodes = set()
    seen_links = set()

    if graph_rows:
        root = graph_rows[0].get("root")
        root_label = first_label(graph_rows[0].get("rootLabels"), "搜索词")
        root_category = add_category(categories_map, root_label, colors)
        root_data = format_node(root, keyword, root_label, root_category, 60, categories_map[root_label]["color"])
        data.append(root_data)
        seen_nodes.add(root_data["id"])

        for row in graph_rows[0].get("rows", []):
            branch_item = row.get("branch") if row else None
            branch = branch_item.get("node") if branch_item else None
            if not branch:
                continue
            branch_labels = branch_item.get("labels") or []
            branch_label = first_label(branch_labels, "分支节点")
            branch_category = add_category(categories_map, branch_label, colors)
            branch_name = node_props(branch).get("name", "")
            branch_data = format_node(branch, branch_name, branch_label, branch_category, 38, categories_map[branch_label]["color"])
            if branch_data["id"] not in seen_nodes:
                data.append(branch_data)
                seen_nodes.add(branch_data["id"])
            link_key = (root_data["id"], branch_data["id"])
            if link_key not in seen_links:
                links.append({
                    "source": root_data["id"],
                    "target": branch_data["id"],
                    "value": branch_item.get("rel", "")
                })
                seen_links.add(link_key)

            for leaf_item in row.get("leaves", []):
                leaf = leaf_item.get("node") if leaf_item else None
                if not leaf:
                    continue
                leaf_labels = leaf_item.get("labels") or []
                leaf_label = first_label(leaf_labels, "延伸节点")
                leaf_category = add_category(categories_map, leaf_label, colors)
                leaf_name = node_props(leaf).get("name", "")
                leaf_data = format_node(leaf, leaf_name, leaf_label, leaf_category, 24, categories_map[leaf_label]["color"])
                if leaf_data["id"] not in seen_nodes:
                    data.append(leaf_data)
                    seen_nodes.add(leaf_data["id"])
                leaf_link_key = (branch_data["id"], leaf_data["id"])
                if leaf_link_key not in seen_links:
                    links.append({
                        "source": branch_data["id"],
                        "target": leaf_data["id"],
                        "value": leaf_item.get("rel", "")
                    })
                    seen_links.add(leaf_link_key)

    if not data:
        fallback = graph.run(
            "MATCH (n) WHERE toLower(n.name) CONTAINS toLower($keyword) RETURN n, labels(n) AS labels LIMIT $limit",
            keyword=keyword,
            limit=limit
        ).data()
        root_category = add_category(categories_map, "搜索词", colors)
        root_data = format_node(None, keyword, "搜索词", root_category, 60, categories_map["搜索词"]["color"])
        data.append(root_data)
        for item in fallback:
            node = item.get("n")
            label = first_label(item.get("labels"), "相关节点")
            category = add_category(categories_map, label, colors)
            related = format_node(node, node_props(node).get("name", ""), label, category, 34, categories_map[label]["color"])
            if related["id"] not in seen_nodes:
                data.append(related)
                seen_nodes.add(related["id"])
                links.append({"source": root_data["id"], "target": related["id"], "value": "相关"})

    if data:
        root_id = data[0]["id"]
        data[0]["x"] = 200
        data[0]["y"] = 150
        data[0]["fixed"] = True
        branch_ids = []
        for link in links:
            if link["source"] == root_id and link["target"] not in branch_ids:
                branch_ids.append(link["target"])
        node_by_id = {node["id"]: node for node in data}
        for branch_index, branch_id in enumerate(branch_ids):
            angle = (2 * np.pi * branch_index / max(len(branch_ids), 1)) - (np.pi / 2)
            branch_node = node_by_id.get(branch_id)
            if branch_node:
                branch_node["x"] = float(200 + 120 * np.cos(angle))
                branch_node["y"] = float(150 + 95 * np.sin(angle))
            leaf_ids = [link["target"] for link in links if link["source"] == branch_id]
            for leaf_index, leaf_id in enumerate(leaf_ids):
                leaf_angle = angle + ((leaf_index - (len(leaf_ids) - 1) / 2) * 0.45)
                leaf_node = node_by_id.get(leaf_id)
                if leaf_node:
                    leaf_node["x"] = float(200 + 205 * np.cos(leaf_angle))
                    leaf_node["y"] = float(150 + 165 * np.sin(leaf_angle))

    id_to_index = {node["id"]: index for index, node in enumerate(data)}
    normalized_links = []
    for link in links:
        if link["source"] in id_to_index and link["target"] in id_to_index:
            normalized_links.append({
                "source": id_to_index[link["source"]],
                "target": id_to_index[link["target"]],
                "value": link.get("value", "")
            })

    return {"nodes": data, "links": normalized_links, "categories": list(categories_map.values())}


@app.route('/api/graph', methods=['GET', 'POST', 'OPTIONS'])
def api_graph():
    if request.method == 'OPTIONS':
        return ("", 204)
    keyword = request.args.get("q", "")
    if request.is_json:
        keyword = request.json.get("k") or request.json.get("q") or keyword
    keyword = (keyword or "").strip()
    if not keyword:
        return jsonify({"result": {"nodes": [], "links": [], "categories": []}})
    return jsonify({"result": build_graph_data(keyword)})


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        # print(123)
        graph = Graph(NEO4J_URL, auth=NEO4J_AUTH)
        ret1 = graph.run(
            "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="皮质")).data()
        # print(ret1)

        # MATCH n=()-[]->()  RETURN n LIMIT 25
        # ret2 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="Ka")).data()
        # print(ret2)
        # ret3 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="粥")).data()
        # print(ret3)
        # ret4 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="Hu")).data()
        # print(ret4)
        # ret5 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 15".format(name="片")).data()
        # print(ret5)
        # ret6 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="儿科")).data()
        # print(ret6)
        # ret7 = graph.run(
        #     "MATCH (n) WHERE n.name=~ '.*{name}.*' RETURN n,labels(n) LIMIT 5".format(name="鱼")).data()
        # print(ret7)
        # print(graph.labels)
        # print(graph.schema.node_labels)
        # for i in ret1:
        #     print(i)
        # match (n:Department)-[]->(nb:Department) WHERE n.name=~ '.*科.*' RETURN n,nb
        # print(ret1)
        # print(type(ret1[0]['n']))
        # print(py2neo.Node())
        # b = ret1[0]['n']
        # print(b)
        # print(type(b))
        # print(ret1[0]['n'])
        nodesStr = json.dumps(ret1, ensure_ascii=False)
        # print(nodesStr)
        nodes = json.loads(nodesStr)
        # print(nodes[0]['n'])
        # print(nodes)
        label = []
        name = []
        des = []
        easyget = []
        curelasttime = []
        department = []
        cause = []
        prevent = []
        symbolSize = [50, 20, 20, 20, 20]
        category = [0, 1, 1, 1, 1]
        x = [300, 100, 500, 100, 500]
        y = [200, 0, 0, 400, 400]
        for i in range(len(nodes)):
            label.append(nodes[i]['labels(n)'])
            name.append(nodes[i]['n']['name'])
            prevent.append(nodes[i]['n']['prevent'])
            curelasttime.append(nodes[i]['n']['cure_lasttime'])
            department.append(nodes[i]['n']['cure_department'][0])
            cause.append(nodes[i]['n']['cause'])
            des.append(nodes[i]['n']['desc'])
            easyget.append(nodes[i]['n']['easy_get'])
        # for i in range(len(nodes)):
        #     if(nodes[i]['labels(n)'][0] == "Disease"):
        #         label.append(nodes[i]['labels(n)'])
        #         name.append(nodes[i]['n']['name'])
        #         prevent.append(nodes[i]['n']['prevent'])
        #         curelasttime.append(nodes[i]['n']['cure_lasttime'])
        #         cause.append(nodes[i]['n']['cause'])
        #         department.append(nodes[i]['n']['cure_department'][0])
        #         des.append(nodes[i]['n']['desc'])
        #         easyget.append(nodes[i]['n']['easy_get'])
        #     elif(nodes[i]['labels(n)'][0] == "Check"):
        #         label.append(nodes[i]['labels(n)'])
        #         name.append(nodes[i]['n']['name'])
        #     elif(nodes[i]['labels(n)'][0] == "Department"):
        #         label.append(nodes[i]['labels(n)'])
        #         name.append(nodes[i]['n']['name'])
        #     elif(nodes[i]['labels(n)'][0] == "Drug"):
        #         label.append(nodes[i]['labels(n)'])
        #         name.append(nodes[i]['n']['name'])
        #     else:
        #         label.append("none")
        #         name.append("none")
        #         prevent.append("none")
        #         curelasttime.append("none")
        #         cause.append("none")
        #         department.append("none")
        #         des.append("none")
        #         easyget.append("none")
        # print(label)
        # print(name)
        # print(prevent)
        # print(curelasttime)
        # print(cause)
        # print(department)
        # print(des)
        # print(easyget)
        data = []
        links = []
        categories = []
        source = [0, 0, 0, 0, 0]
        target = [1, 2, 3, 4, 5]
        # label = ["皮质1", "皮质2", "皮质3", "皮质4", "皮质5"]
        color = ["#bea0ff", "#d2b7fd", "#d2b7fd", "#d2b7fd", "#d2b7fd"]
        # new1 = {}
        # new2 = {}
        # new3 = {}

        # for i in range(len(nodes)):
        #     new1 = {}
        #     new_name = {}
        #     key_name = "name"
        #     value_name = name[i]
        #     new_name[key_name] = value_name
        #     if(label[i][0] == "Disease"):
        #         data.append(new_name)
        #     if(label[i][0] == "Check"):
        #         data.append(new_name)

        #     new2 = {"source": source[i], "target": target[i]}
        #     new3 = {"name": label[i][0], "itemStyle": {
        #         "normal": {"color": color[i]}}}
        #     data.append(new1)
        #     links.append(new2)
        #     categories.append(new3)
        # data = {"nodes": data, "links": links, "categories": categories}
        # print(data)

        for i in range(len(nodes)):
            print(label[i][0])
            new1 = {"name": name[i],  "prevent": prevent[i], "curelasttime": curelasttime[i], "department": department[i], "cause": cause[i], "des": des[i], "easyget": easyget[i], "symbolSize": symbolSize[i],
                    "category": category[i], "x": x[i], "y": y[i]}
            new2 = {"source": source[i], "target": target[i]}
            new3 = {"name": label[i][0], "itemStyle": {
                "normal": {"color": color[i]}}}
            data.append(new1)
            links.append(new2)
            categories.append(new3)
        data = {"nodes": data, "links": links, "categories": categories}

        print(data)
        return render_template('chartjs.html', data=data)
    elif request.method == 'POST':
        getK = request.json.get('k')
        print("收到浏览器post传回来的参数K值为：" + getK)
        return {"result": build_graph_data(getK)}


if __name__ == "__main__":
    app.run(debug=True)
