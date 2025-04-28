qx.Class.define("twindapp.data.CrmData",
    {
      extend : qx.core.Object,
    
      statics :
      {
        DATA : {
          contacts : [
            {"id":91,"name":"Lempi Adams","firstname":"Lempi","lastname":"Adams","phone":"844.494.8045","city":"North Gussieland","deleted_at":null,"organization":"O'Kon, Oberbrunner and Gibson","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":83,"name":"Quinton Bailey","firstname":"Quinton","lastname":"Bailey","phone":"(800) 354-0490","city":"New Bernadette","deleted_at":null,"organization":"Ferry-Stiedemann","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":78,"name":"Murray Bashirian","firstname":"Murray","lastname":"Bashirian","phone":"866-414-2117","city":"Gradychester","deleted_at":null,"organization":"Kemmer, Grady and Zulauf","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":76,"name":"Abigale Baumbach","firstname":"Abigale","lastname":"Baumbach","phone":"1-844-206-8699","city":"Clairtown","deleted_at":null,"organization":"Blick Inc","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":97,"name":"Russ Bernier","firstname":"Russ","lastname":"Bernier","phone":"800.462.9296","city":"Savionmouth","deleted_at":null,"organization":"Luettgen, Greenfelder and Nikolaus","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":27,"name":"Trevor Bode","firstname":"Lempi","lastname":"Adams","phone":"(888) 770-9690","city":"West Domingo","deleted_at":null,"organization":"Davis, Weissnat and Rath","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":38,"name":"Franz Bogan","firstname":"Lempi","lastname":"Adams","phone":"1-866-812-2361","city":"Kubhaven","deleted_at":null,"organization":"Mayert LLC","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":29,"name":"Jadon Borer","firstname":"Lempi","lastname":"Adams","phone":"844.537.9412","city":"Littlefurt","deleted_at":null,"organization":"McClure PLC","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":87,"name":"Abdul Boyle","firstname":"Lempi","lastname":"Adams","phone":"1-800-295-5093","city":"New Delmer","deleted_at":null,"organization":"Feest-Beer","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"},
            {"id":9,"name":"Sandrine Brakus","firstname":"Lempi","lastname":"Adams","phone":"855-487-6677","city":"Taureanside","deleted_at":null,"organization":"Hegmann, Quitzon and Hahn","address":"100 Main Street","state":"Texas","country":"US","postalcode":"78701","email":"test@test.com"}
          ],
          contactspageing : {
            "first_page_url":"http:\/\/pingcrm.test\/contacts?page=1","from":1,"last_page":4,"last_page_url":"http:\/\/pingcrm.test\/contacts?page=4",
            "links":[
              {"url":null,"label":"&laquo; Previous","active":false},
              {"url":"http:\/\/pingcrm.test\/contacts?page=1","label":"1","active":true},
              {"url":"http:\/\/pingcrm.test\/contacts?page=2","label":"2","active":false},
              {"url":"http:\/\/pingcrm.test\/contacts?page=3","label":"3","active":false},
              {"url":"http:\/\/pingcrm.test\/contacts?page=4","label":"4","active":false},
              {"url":"http:\/\/pingcrm.test\/contacts?page=2","label":"Next &raquo;","active":false}
            ],
            "next_page_url":"http:\/\/pingcrm.test\/contacts?page=2","path":"http:\/\/pingcrm.test\/contacts","per_page":10,"prev_page_url":null,"to":10,"total":40
          }
        }
      }
    });