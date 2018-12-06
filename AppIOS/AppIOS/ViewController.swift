//
//  ViewController.swift
//  AppIOS
//
//  Created by Andrea Diaz ♡ on 11/17/18.
//  Copyright © 2018 Andrea Diaz ♡. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    @IBOutlet weak var txtUsername: UITextField!
    @IBOutlet weak var txtPassword: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
    }
    
    
    @IBAction func btnLogin(_ sender: UIButton) {
        guard let username = txtUsername.text, let password = txtPassword.text,
            username.count > 0, password.count > 0
            else {
                return
            }
        
        APIClient.login(withUsername: txtUsername.text!, password: txtPassword.text!, completion: {
            if UserDefaults.standard.string(forKey: "response") == "1" {
                let storyboard = UIStoryboard(name: "Main", bundle: nil)
                let controller = storyboard.instantiateViewController(withIdentifier: "Home") as! HomeController
                self.present(controller, animated: true, completion: nil)
            }
        })
    }
}



