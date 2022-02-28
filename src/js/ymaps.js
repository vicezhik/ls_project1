function mapInit() { 
    ymaps.ready(() => { 
        let myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 11
        });

        myMap.events.add('click', function (e) {
            if (!myMap.balloon.isOpen()) {
                var coords = e.get('coords');
                myMap.balloon.open(coords, {
                    contentHeader:'Событие!',
                    contentBody:'<p>Кто-то щелкнул по карте.</p>' +
                        '<p>Координаты щелчка: ' + [
                        coords[0].toPrecision(6),
                        coords[1].toPrecision(6)
                        ].join(', ') + '</p>',
                    contentFooter:'<sup>Щелкните еще раз</sup>'
                });
            }
            else {
                myMap.balloon.close();
            }
        });
    });
 
}

export { 
    mapInit
}