//
//  APIClient.swift
//  Ad Aeger
//
//  Created by Andrea Diaz ♡ on 11/18/18.
//  Copyright © 2018 Andrea Diaz ♡. All rights reserved.
//

import Foundation
import Alamofire
import AlamofireObjectMapper
import ObjectMapper

class Medications: Mappable {
    var id: String?
    var association_id: String?
    var med_quantity: String?
    var med_brand_name: String?
    var med_diagnosis: String?
    var med_drug: String?
    var med_dosis: String?
    var med_prescribed_by: String?
    var parent: String?
    
//    init(json: Dictionary<String, Any>) {
//        self.id = json["user_id"] as? String ?? ""
//        self.med_brand_name = json["med_brand_name"] as? String ?? ""
//        self.med_drug = json["med_drug"] as? String ?? ""
//        self.med_dosis = json["med_dosis"] as? String ?? ""
//        self.med_prescribed_by = json["med_prescribed_by"] as? String ?? ""
//        self.med_diagnosis = json["med_diagnosis"] as? String ?? ""
//        self.med_quantity = json["med_quantity"] as? String ?? ""
//    }
    
    required init? (map: Map) {}
    
    func mapping (map: Map) {
        self.id <- map["id"]
        self.med_brand_name <- map["med_brand_name"]
        self.med_drug <- map["med_drug"]
        self.med_dosis <- map["med_dosis"]
        self.med_prescribed_by <- map["med_prescribed_by"]
        self.med_diagnosis <- map["med_diagnosis"]
        self.med_quantity <- map["med_quantity"]
        
    }
}

class APIClient {
    static func signup(withUsername username: String, password: String) {
        print("Sending request")
        let parameters: Parameters = ["username": username, "password": password]
        Alamofire.request("https://67178a13.ngrok.io/app_signup", method: .post, parameters: parameters).responseJSON { response in
            if let json = response.result.value {
                print("JSON: \(json)")
            }
        }
    }
    
    static func login(withUsername username: String, password: String, completion: @escaping () -> Void) {
        print("Sending request login")
        let parameters: Parameters = ["username": username, "password": password]
        Alamofire.request("https://67178a13.ngrok.io/app_login", method: .post, parameters: parameters, encoding: JSONEncoding.default).responseJSON {
            response in
            if let json = response.result.value as? [String: AnyObject] {
                print("JSON: \(json)")
                
                if let logged = json["response"] {
                    UserDefaults.standard.set(logged, forKey: "response")
                }
            }
            completion()
        }
    }
    
    static func medicationsFetch() {
        print("fetching medications")
        Alamofire.request("http://10.100.240.164:8800/medications", method: .get).responseArray{(response: DataResponse<[Medications]>) in
            let meds = response.result.value
            
            if let meds = meds {
                for med in meds {
                    print(med.med_brand_name)
                }
            }
        }
    }
}
