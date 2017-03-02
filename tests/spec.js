'use strict';

var request      = require('supertest-as-promised'),
    expect       = require('chai').expect,
    should       = require('chai').should(),
    mongoose     = require('mongoose'),
    js2xmlparser = require("js2xmlparser"),
    assert       = require('assert'),
    xml2js       = require('xml2js').parseString,
    child_process = require('child_process'),
    autils = require('../node_modules/approvals/lib/Autils');

/**
 * Kdiff3 reporter
 */

var DiffMergeReporter = {
  canReportOn: function (fileName) {
    return true;
  },
  report: function (approved, received, spawn) {
    spawn = spawn || child_process.spawn;
    autils.createEmptyFileIfNotExists(approved);

    var exe = "/Applications/DiffMerge.app/Contents/MacOS/DiffMerge";

    console.log('CMD: ' + [exe, received, approved].join(' '));

    spawn(exe, [received, approved], {
      detached: true,
      stdio: ['pipe', 1, 2, 'ipc']
    });
  }
}

require('approvals')
  .mocha();

mongoose.createConnection('mongodb://localhost/restful-booker');

var generatePayload = function(firstname, lastname, totalprice, depositpaid, additionalneeds, checkin, checkout){
  var payload = {
      'firstname': firstname,
      'lastname': lastname,
      'totalprice': totalprice,
      'depositpaid': depositpaid,
      'bookingdates': {
        'checkin': checkin,
        'checkout': checkout
      }
    }

  if(typeof(additionalneeds) !== 'undefined'){
    payload.additionalneeds = additionalneeds;
  }

  return payload
}

var payload  = generatePayload('Sally', 'Brown', 111, true, 'Breakfast', '2013-02-01', '2013-02-04'),
    payload2 = generatePayload('Geoff', 'White', 111, true, 'Breakfast', '2013-02-02', '2013-02-05'),
    payload3 = generatePayload('Bob', 'Brown', 111, true, 'Breakfast', '2013-02-03', '2013-02-06');

var server = require('../app')

describe('restful-booker', function () {

  beforeEach(function(){
    mongoose.connection.db.dropDatabase();
  })

  it('responds to /ping', function testPing(done){
    request(server)
      .get('/ping')
      .expect(201, done);
  });

  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });

});

describe('restful-booker - GET /booking', function () {

  beforeEach(function(){
    mongoose.connection.db.dropDatabase();
  })

  // it('responds with all booking ids when GET /booking', function testGetAllBookings(done){
  //   var that = this;
  //
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking')
  //         .expect(200)
  //         .expect(function(res){
  //           // res.body[0].should.have.property('bookingid').and.match(/[0-9]/);
  //           // res.body[1].should.have.property('bookingid').and.match(/[0-9]/);
  //           that.verifyAsJSON(res.body, { reporters: [DiffMergeReporter] });
  //         })
  //         .end(done);
  //     });
  // });

  // it('responds with a subset of booking ids when searching by firstname date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?firstname=Geoff')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(2);
  //         })
  //         .end(done)
  //     })
  // });
  //
  // it('responds with a subset of booking ids when searching by lastname date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?lastname=White')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(2);
  //         })
  //         .end(done)
  //     })
  // });
  //
  // it('responds with a subset of booking ids when searching for checkin date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?checkin=2013-02-01')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(2);
  //         })
  //         .end(done)
  //     })
  // });
  //
  // it('responds with a subset of booking ids when searching for checkout date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?checkout=2013-02-05')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(1);
  //         })
  //         .end(done)
  //     })
  // });
  //
  // it('responds with a subset of booking ids when searching for checkin and checkout date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload3)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?checkin=2013-02-01&checkout=2013-02-06')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(2);
  //         })
  //         .end(done)
  //     });
  // });
  //
  // it('responds with a subset of booking ids when searching for name, checkin and checkout date', function testQueryString(done){
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload2)
  //     }).then(function(){
  //       return request(server)
  //         .post('/booking')
  //         .send(payload3)
  //     }).then(function(){
  //       request(server)
  //         .get('/booking?firstname=Geoff&lastname=White&checkin=2013-02-01&checkout=2013-02-06')
  //         .expect(200)
  //         .expect(function(res){
  //           res.body[0].should.have.property('bookingid').and.equal(2);
  //         })
  //         .end(done)
  //     })
  // });
  //
  // it('responds with a 500 error when GET /booking with a bad date query string', function testGetWithBadDate(done){
  //   request(server)
  //     .get('/booking?checkout=2013-02-0')
  //     .expect(500, done)
  // });
  //
  it('responds with a payload when GET /booking/{id}', function testGetOneBooking(done){
    var that = this;

    var dateScrubber = function(data){
      return data.replace(/[0-9]*-[0-9]*-[0-9]*/g, '**scrubbed-name**');
    }

    var multiScrubber = function() {
      var scrubbers = arguments;

      return function(data){
        for (var i = 0; i < scrubbers.length; i++) {
          data = scrubbers[i](data);
        }

        return data
      }
    }

    var verify = function(data, scrubber){
      var json = JSON.stringify(data, null, '  ')

      if(scrubber == null){
        scrubber = function(data) {
          return data
        }
      }

      json = scrubber(json);

      that.verify(json, { reporters: [DiffMergeReporter] });
    }

    request(server)
      .post('/booking')
      .send(payload)
      .then(function(){
        request(server)
          .get('/booking/1')
          .set('Accept', 'application/json')
          .expect(function(res){


            var sallyScrubber = function(data){
              return data.replace('Sally', '**scrubbed-date**');
            }

            verify(res.body, multiScrubber(dateScrubber, sallyScrubber));
          })
          .end(done);
      });
  });
  //
  // it('responds with an XML payload when GET /booking/{id} with accept application/xml', function testGetWithXMLAccept(done){
  //   xmlPayload = js2xmlparser('booking', payload)
  //
  //   request(server)
  //     .post('/booking')
  //     .send(payload)
  //     .then(function(){
  //       request(server)
  //         .get('/booking/1')
  //         .set('Accept', 'application/xml')
  //         .expect(200)
  //         .expect(xmlPayload, done)
  //     });
  // });

});

// describe('restful-booker - POST /booking', function () {
//   beforeEach(function(){
//     mongoose.connection.db.dropDatabase();
//   })
//
//   it('responds with the created booking and assigned booking id', function testCreateBooking(done){
//     request(server)
//       .post('/booking')
//       .set('Accept', 'application/json')
//       .send(payload)
//       .expect(200)
//       .expect(function(res){
//         res.body.bookingid.should.equal(1);
//         res.body.booking.should.deep.equal(payload);
//       })
//       .end(done)
//   });
//
//   it('responds with the created booking and assigned booking id when sent an XML payload', function testCreateBooking(done){
//     var xmlPayload = js2xmlparser('booking', payload)
//
//     request(server)
//       .post('/booking')
//       .set('Content-type', 'text/xml')
//       .set('Accept', 'application/json')
//       .send(xmlPayload)
//       .expect(200)
//       .expect(function(res){
//         res.body.bookingid.should.equal(1);
//         res.body.booking.should.deep.equal(payload);
//       })
//       .end(done)
//   });
//
//   it('responds with a 500 error when a bad payload is sent', function testCreateBadBooking(done){
//     badpayload = { 'lastname': 'Brown', 'totalprice': 111, 'depositpaid': true, 'additionalneeds': 'Breakfast'}
//
//     request(server)
//       .post('/booking')
//       .send(badpayload)
//       .expect(500, done);
//   });
//
//   it('responds with the correct assigned booking id when multiple payloads are sent', function testBookingId(done){
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(){
//         request(server)
//           .post('/booking')
//           .send(payload2)
//           .set('Accept', 'application/json')
//           .expect(200)
//           .expect(function(res) {
//             res.body.bookingid.should.equal(2);
//           })
//           .end(done)
//       })
//   });
//
//   it('responds with an XML payload when POST /booking with accept application/xml', function testGetWithXMLAccept(done){
//     var xmlPayload = js2xmlparser('created-booking', { "bookingid": 1, "booking": payload2 })
//
//     parseBooleans = function(str) {
//       if (/^(?:true|false)$/i.test(str)) {
//         str = str.toLowerCase() === 'true';
//       }
//       return str;
//     };
//
//     parseNumbers = function(str) {
//       if (!isNaN(str)) {
//         str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
//       }
//       return str;
//     };
//
//     request(server)
//       .post('/booking')
//       .set('Accept', 'application/xml')
//       .send(payload2)
//       .expect(200)
//       .expect(function(res){
//         xml2js(res.text, {explicitArray: false, valueProcessors: [parseNumbers, parseBooleans]}, function (err, result) {
//           result['created-booking'].booking.should.deep.equal(payload2);
//           result['created-booking'].bookingid.should.equal(1);
//         });
//       })
//       .end(done);
//   });
//
//   it('responds with a 200 when a payload with too many params are sent', function testCreateExtraPayload(done){
//     var extraPayload = payload
//     extraPayload.extra = 'bad'
//
//     request(server)
//       .post('/booking')
//       .set('Accept', 'application/json')
//       .send(extraPayload)
//       .expect(200, done);
//   });
//
//   it('responds with a 418 when using a bad accept header', function testTeapot(done){
//     request(server)
//       .post('/booking')
//       .set('Accept', 'application/ogg')
//       .send(payload)
//       .expect(418, done)
//   })
// });
//
// describe('restful-booker POST /auth', function(){
//
//   it('responds with a 200 and a token to use when POSTing a valid credential', function testAuthReturnsToken(done){
//     request(server)
//       .post('/auth')
//       .send({'username': 'admin', 'password': 'password123'})
//       .expect(200)
//       .expect(function(res){
//         res.body.should.have.property('token').and.to.match(/[a-zA-Z0-9]{15,}/);
//       })
//       .end(done)
//   })
//
//   it('responds with a 200 and a message informing of login failed when POSTing invalid credential', function testAuthReturnsError(done){
//     request(server)
//       .post('/auth')
//       .send({'username': 'nimda', 'password': '321drowssap'})
//       .expect(200)
//       .expect(function(res){
//         res.body.should.have.property('reason').and.to.equal('Bad credentials');
//       })
//       .end(done)
//   })
//
// });
//
// describe('restful-booker - PUT /booking', function () {
//
//   it('responds with a 403 when no token is sent', function testNoLoginForPut(done){
//     request(server)
//       .put('/booking/1')
//       .expect(403, done);
//   });
//
//   it('responds with a 403 when not authorised', function testBadLoginForPut(done){
//       request(server)
//         .post('/auth')
//         .send({'username': 'nmida', 'password': '321drowssap'})
//         .expect(200)
//         .then(function(res){
//           request(server)
//             .put('/booking/1')
//             .set('Accept', 'application/json')
//             .set('Cookie', 'token=' + res.body.token)
//             .send(payload2)
//             .expect(403, done)
//         })
//   });
//
//   it('responds with a 200 and an updated payload', function testUpdatingABooking(done){
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(){
//         return request(server)
//           .post('/auth')
//           .send({'username': 'admin', 'password': 'password123'})
//       })
//       .then(function(res){
//         request(server)
//           .put('/booking/1')
//           .set('Accept', 'application/json')
//           .set('Cookie', 'token=' + res.body.token)
//           .send(payload2)
//           .expect(200)
//           .expect(payload2, done);
//       })
//   });
//
//   it('responds with a 200 and an updated payload using auth', function testUpdatingABooking(done){
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(res){
//         request(server)
//           .put('/booking/1')
//           .set('Accept', 'application/json')
//           .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQxMjM=')
//           .send(payload2)
//           .expect(200)
//           .expect(payload2, done);
//       })
//   });
//
//   it('responsds with a 405 when attempting to update a booking that does not exist', function testUpdatingNonExistantBooking(done){
//       request(server)
//       .post('/auth')
//       .send({'username': 'admin', 'password': 'password123'})
//       .then(function(res){
//         request(server)
//           .put('/booking/100000')
//           .set('Accept', 'application/json')
//           .set('Cookie', 'token=' + res.body.token)
//           .send(payload2)
//           .expect(405, done);
//       })
//   })
//
//   it('responds with a 200 and an updated payload when requesting with an XML', function testUpdatingABookingWithXML(done){
//     var xmlPayload = js2xmlparser('booking', payload2)
//
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(){
//         return request(server)
//           .post('/auth')
//           .send({'username': 'admin', 'password': 'password123'})
//       })
//       .then(function(res){
//         request(server)
//           .put('/booking/1')
//           .set('Cookie', 'token=' + res.body.token)
//           .set('Content-type', 'text/xml')
//           .set('Accept', 'application/json')
//           .send(xmlPayload)
//           .expect(200)
//           .expect(payload2, done);
//       })
//   });
//
//   it('responds with an XML payload when PUT /booking with accept application/xml', function testPutWithXMLAccept(done){
//     xmlPayload = js2xmlparser('booking', payload2)
//
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(){
//         return request(server)
//           .post('/auth')
//           .send({'username': 'admin', 'password': 'password123'})
//       })
//       .then(function(res){
//         request(server)
//           .put('/booking/1')
//           .set('Cookie', 'token=' + res.body.token)
//           .set('Accept', 'application/xml')
//           .send(payload2)
//           .expect(200)
//           .expect(xmlPayload, done);
//       })
//   });
// });
//
// describe('restful-booker DELETE /booking', function(){
//
//   it('responds with a 403 when not authorised', function testNoLoginForDelete(done){
//     request(server)
//       .delete('/booking/1')
//       .expect(403, done);
//   });
//
//   it('responds with a 403 when not authorised', function testBadLoginForDelete(done){
//       request(server)
//         .post('/auth')
//         .send({'username': 'nmida', 'password': '321drowssap'})
//         .expect(200)
//         .then(function(res){
//           request(server)
//             .delete('/booking/1')
//             .set('Cookie', 'token=' + res.body.token)
//             .expect(403, done)
//         })
//   })
//
//   it('responds with a 201 when deleting an existing booking', function testDeletingAValidBooking(done){
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(){
//         return request(server)
//           .post('/auth')
//           .send({'username': 'admin', 'password': 'password123'})
//       })
//       .then(function(res){
//         return request(server)
//           .delete('/booking/1')
//           .set('Cookie', 'token=' + res.body.token)
//           .expect(201)
//       }).then(function(){
//         request(server)
//           .get('/booking/1')
//           .expect(404, done)
//       });
//   });
//
//   it('responds with a 201 when deleting an existing booking with a basic auth header', function testDeletingAValidBookingWithAuth(done){
//     request(server)
//       .post('/booking')
//       .send(payload)
//       .then(function(res){
//         return request(server)
//           .delete('/booking/2')
//           .set('Authorization', 'Basic YWRtaW46cGFzc3dvcmQxMjM=')
//           .expect(201)
//       }).then(function(){
//         request(server)
//           .get('/booking/2')
//           .expect(404, done)
//       });
//   });
//
//   it('responds with a 405 when deleting a non existing booking', function testDeletingNonExistantBooking(done){
//     request(server)
//       .post('/auth')
//       .send({'username': 'admin', 'password': 'password123'})
//       .then(function(res){
//         request(server)
//           .delete('/booking/1')
//           .set('Cookie', 'token=' + res.body.token)
//           .expect(405, done)
//       })
//   })
//
// });
