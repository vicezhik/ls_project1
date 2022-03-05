
import renderForm from '../templates/form.hbs'

let storage = localStorage;
//storage.data = JSON.stringify({}); 
let myMap = {};
let clusterer = {};

document.querySelector('#map').addEventListener('click',function(e){
    const elem = e.target;
    if(elem.id === 'reviewButton'){
        e.preventDefault();
        eventReviewForm();
    }
});


function mapInit() { 
    ymaps.ready(() => { 
        myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 11
        }, {
            balloonMaxWidth: 300,
        }),
        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            groupByCoordinates: false,
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false,
            clusterBalloonContentLayoutHeight:400
        });
        myMap.events.add('click', function (e) {
            if (!myMap.balloon.isOpen()) {
                const coords = e.get('coords');
                
                const obForm = getDataPoint(`${coords[0].toPrecision(8)},${coords[1].toPrecision(8)}`);
                myMap.balloon.open(coords, {
                    contentBody: renderForm(obForm)
                }); 
            }
            else {
                myMap.balloon.close();
            }
        });

        const data = JSON.parse(storage.data || '{}');
        for(const point in data){
            addPointMap(point);
        }
        myMap.geoObjects.add(clusterer);
        
    });
 
}

function getDataPoint(coords){
    const data = JSON.parse(storage.data || '{}');
    const obForm = {
        coords:coords, 
        list:[]
    }
    if(coords in data) {
        obForm.list = data[coords];
    }
    return obForm;
}

function setDataPoint(coords, data){
    const dataStorage = JSON.parse(storage.data || '{}');
    if(!(coords in dataStorage)) dataStorage[coords] = [];
    
    dataStorage[coords].push(data);
    storage.data = JSON.stringify(dataStorage);
}


function addPointMap(coords){
    const objects = clusterer.getGeoObjects();
    let placemark = '';
    for(const i in objects){
        
        if(coords === objects[i].geometry._coordinates.join(',')){
            placemark = objects[i];
        }
    }
    const obForm = getDataPoint(coords);
    if(placemark){
        placemark.properties.set('balloonContent', renderForm(obForm));
    }
    else{
        ymaps.geocode(coords.split(',')).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            const placemarkNew = new ymaps.Placemark(coords.split(','), {
                balloonContent: renderForm(obForm),
                clusterCaption: firstGeoObject.getAddressLine()
            });
            clusterer.add(placemarkNew);
        });

    }
}

function eventReviewForm(placemark=''){
    const elem = document.querySelector('#reviewForm');
        try {
            let error = false;
            for(const key of ['name', 'place', 'message']){
                if(elem.elements[key].value.trim() === ''){
                    elem.elements[key].classList.add('error');
                    error = true;
                }
                else{
                    elem.elements[key].classList.remove('error');
                }
            }
            if(error) throw 'error';

            const coords = elem.elements.coords.value;
            
            
            const review = {
                name : elem.elements.name.value,
                place: elem.elements.place.value,
                message: elem.elements.message.value
            }
            setDataPoint(coords, review);
            addPointMap(coords, placemark);
            if(!placemark){
                myMap.balloon.close();
            }
           // myMap.balloon.close();

        }
         catch (e) {
           //alert('Заполните все поля'); 
        }
} 
export { 
    mapInit
}