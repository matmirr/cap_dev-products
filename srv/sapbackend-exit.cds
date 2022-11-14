using {sapbackend as external} from './external/sapbackend.csn';

define service SAPBackendExit {

    @cds.persistence : {
        table,
        skip : false
    }
    entity Incidents as projection on external.IncidentsSet;

};

@protocol: 'rest'
define service RestService {

    entity Incidents as select from SAPBackendExit.Incidents;

};