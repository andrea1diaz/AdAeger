//
//  ViewController.swift
//  Ad Aeger
//


import Foundation
import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        handleLogin()
    }
    
    @objc func handleLogin() {
        let loginController = LoginController()
        present(loginController, animated: true, completion: nil)
    }
}
