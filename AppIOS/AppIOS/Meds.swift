//
//  Meds.swift
//  Ad Aeger
//


import Foundation
import UIKit

class Meds: NSObject {
    var user_id: String?
    var med_brand_name: String?
    var med_drug: String?
    var med_dosis: String?
    var med_prescribed_by: String?
    var med_diagnosis: String?
    var med_quantity: String?
    
    init(dictionary: [String: Any]) {
        self.user_id = dictionary["user_id"] as? String ?? ""
        self.med_brand_name = dictionary["med_brand_name"] as? String ?? ""
        self.med_drug = dictionary["med_drug"] as? String ?? ""
        self.med_dosis = dictionary["med_dosis"] as? String ?? ""
        self.med_prescribed_by = dictionary["med_prescribed_by"] as? String ?? ""
        self.med_diagnosis = dictionary["med_diagnosis"] as? String ?? ""
        self.med_quantity = dictionary["med_quantity"] as? String ?? ""
    }

}


