var slider = new Slider({
    container: document.getElementById('container'), radius: 150,
    onChange: function (v) { return document.getElementById('value1').textContent = v; }
});
var slider2 = new Slider({
    container: document.getElementById('container'),
    radius: 120, step: 5,
    color: '#abff68',
    onChange: function (v) { return document.getElementById('value2').textContent = v; }
});
var slider3 = new Slider({
    container: document.getElementById('container'),
    radius: 90,
    step: 0.5,
    color: '#ff9835',
    onChange: function (v) { return document.getElementById('value3').textContent = v; }
});
var slider4 = new Slider({
    container: document.getElementById('container'),
    radius: 60,
    min: 100,
    max: 200,
    step: 2,
    color: '#7798ff',
    onChange: function (v) { return document.getElementById('value4').textContent = v; }
});
