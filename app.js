var apn = require('apn');
var https = require("https");

var apnProvider = new apn.Provider({
    token: {
        key: 'AuthKey_4W5S6UVW8S.p8', // Path to the key p8 file
        keyId: '4W5S6UVW8S', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
        teamId: 'TS3CF84ZNK', // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
    },
    production: false // Set to true if sending a notification to a production iOS app
});

setInterval(() => {

    const data = JSON.stringify({});

    const options = {
        hostname: 'transfer.domitoapp.cl',
        port: 443,
        path: '/source/httprequest/notificacion/GetNotificacionesIOS.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, (res) => {
        //console.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d) => {
            let json = JSON.parse(d);
            if (json.length === 0) {
                console.log("no hay notificacione pendientes")
            }
            for (let i = 0; i < json.length; i++) {
                let aux = json[i];
                let deviceID = aux.notificacion_device_id;
                let id = aux.notificacion_id;
                let texto = aux.notificacion_texto;
                let tipo = aux.notificacion_tipo;
                var notification = new apn.Notification();
                notification.topic = 'cl.domito.DMT-Transfer';
                notification.badge = 3;
                notification.sound = 'ping.aiff';
                notification.alert = texto;
                notification.payload = { id: id };
                apnProvider.send(notification, deviceID).then(function(result) {
                    console.log(result);
                });

                if (tipo == '1' || tipo == '2') {
                    actualizarEstadoNotificacion(id)
                }


            }
        })
    })

    req.on('error', (error) => {
        console.error(error)
    });

    req.write(data)
    req.end()

}, 10000);


function actualizarEstadoNotificacion(id) {
    const data = JSON.stringify({ id: id, servicio: "x" });

    const options = {
        hostname: 'transfer.domitoapp.cl',
        port: 443,
        path: '/source/httprequest/notificacion/ModEstadoNotificacion.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    }

    const req = https.request(options, (res) => {
        res.on('data', (d) => {
            let json = JSON.parse(d);
            console.log(json.notificacion_id)
        })
    })

    req.on('error', (error) => {
        console.error(error)
    });

    req.write(data)
    req.end()
}