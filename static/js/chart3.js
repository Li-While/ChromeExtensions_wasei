var frogGraphChart = null;

function setGraphStatus(message) {
    var status = document.getElementById('frog-graph-status');
    if (status) {
        status.textContent = message || '';
    }
}

function setNodeDetail(node) {
    var fields = {
        "modal_name": node && node.name ? node.name : "未选择节点",
        "modal_desc": "名词解释：" + ((node && node.des) || ""),
        "modal_easyget": "易感人群：" + ((node && node.easyget) || ""),
        "modal_curelasttime": "治疗周期：" + ((node && node.curelasttime) || ""),
        "modal_department": "部门：" + ((node && node.department) || ""),
        "modal_cause": "成因：" + ((node && node.cause) || ""),
        "modal_prevent": "预防：" + ((node && node.prevent) || "")
    };
    Object.keys(fields).forEach(function (className) {
        var element = document.getElementsByClassName(className)[0];
        if (element) {
            element.textContent = fields[className];
        }
    });
}

function draw(data) {
    var chartDom3 = document.getElementById('chart3');
    if (!chartDom3 || typeof echarts === "undefined") {
        return;
    }
    if (!frogGraphChart) {
        frogGraphChart = echarts.init(chartDom3);
        window.frogGraphChart = frogGraphChart;
    }
    var myChart3 = frogGraphChart;
    var option3;

    myChart3.showLoading();
    myChart3.hideLoading();
    data = data || { nodes: [], links: [], categories: [] };
    if (!data.nodes || data.nodes.length === 0) {
        setGraphStatus("没有匹配到图谱数据");
        myChart3.clear();
        setNodeDetail(null);
        return;
    }
    setGraphStatus("已加载 " + data.nodes.length + " 个节点");
    var palette = ["#7C3AED", "#0EA5A4", "#F59E0B", "#EF4444", "#2563EB", "#16A34A", "#DB2777", "#64748B"];
    var labelColorMap = {};
    data.categories = (data.categories || []).map(function (category, index) {
        var color = category.color ||
            (category.itemStyle && (category.itemStyle.color || (category.itemStyle.normal && category.itemStyle.normal.color))) ||
            palette[index % palette.length];
        labelColorMap[category.name] = color;
        category.itemStyle = { color: color };
        return category;
    });
    data.nodes = data.nodes.map(function (node) {
        var label = node.labelName;
        if (!label && data.categories[node.category]) {
            label = data.categories[node.category].name;
        }
        var color = labelColorMap[label] || palette[(node.category || 0) % palette.length];
        node.itemStyle = Object.assign({}, node.itemStyle || {}, { color: color });
        return node;
    });
    option3 = {
        // 提示框的配置
        tooltip: {
            formatter: function (x) {
                return x.data.des;
            }
        },
        // 工具箱
        toolbox: {
            // 显示工具箱
            show: true,
            feature: {
                mark: {
                    show: true
                },
                // 还原
                restore: {
                    show: true
                },
                // 保存为图片
                saveAsImage: {
                    show: true
                }
            }
        },
        legend: [{
            data: data.categories.map(function (a) {
                return a.name;
            })
        }],
        series: [
            {
                // name: 'ret5',
                type: 'graph',
                layout: 'force',
                symbolSize: 40,
                roam: true,
                data: data.nodes,
                links: data.links,
                categories: data.categories,
                force: {
                    repulsion: 900,//排斥力
                    edgeLength: [70, 130]//关系线长度
                },
                draggable: true,//拖动
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}'// 标签内容格式器。模板变量有 {a}、{b}、{c}，分别表示系列名，数据名，数据值。
                },
                labelLayout: {
                    hideOverlap: true
                },
                scaleLimit: {
                    min: 0.4,
                    max: 2
                },
                edgeLabel: {
                    show: false
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.18,
                    normal: {
                        width: 0.7,
                        color: '#bea0ff',
                    }
                }
            }
        ]
    };
    myChart3.setOption(option3);
    // });
    option3 && myChart3.setOption(option3);

    myChart3.off('click');
    myChart3.on('click', function (param) {
        console.log('param---->', param); // 打印出param, 可以看到里边有很多参数可以使用
        //获取节点点击的数组序号
        var arrayIndex = param.dataIndex;
        console.log('arrayIndex---->', arrayIndex);
        console.log('name---->', param.name);
        if (param.dataType == 'node') {
            setNodeDetail(param.data);

            // alert("点击了节点" + param.name)
        } else {
            // alert("点击了边" + param.value)
            // var explain = document.getElementById("explain");
            // param.setAttribute("data-bs-toggle", "modal");
            // param.setAttribute("data-bs-target", "#myModal");
        }
    });
}

window.frogDrawGraph = draw;
window.addEventListener('resize', function () {
    if (frogGraphChart) {
        frogGraphChart.resize();
    }
});

if (typeof data !== "undefined") {
    draw(data);
}
