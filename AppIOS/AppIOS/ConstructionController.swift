//
//  ConstructionController.swift
//  Ad Aeger
//

import UIKit

class ConstructionController: UIViewController {
    
    let inputsContainerView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor.white
        view.translatesAutoresizingMaskIntoConstraints = false
        view.layer.cornerRadius = 5
        view.layer.masksToBounds = true
        return view
    }()
    
    
    let userTextField: UITextField = {
        let tf = UITextField()
        tf.placeholder = "I N  P R O G R E S S"
        tf.translatesAutoresizingMaskIntoConstraints = false
        return tf
    }()
    
    let profileImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.image = UIImage(named: "logo_t")
        imageView.translatesAutoresizingMaskIntoConstraints = false
        imageView.contentMode = .scaleAspectFill
        return imageView
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = UIColor.white
        
        view.addSubview(inputsContainerView)
        view.addSubview(profileImageView)
        
        setupInputsContainerView()
        setupProfileImageView()
    }
    
    func setupProfileImageView() {
        //need x, y, width, height constraints
        profileImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        profileImageView.bottomAnchor.constraint(equalTo: inputsContainerView.topAnchor, constant: -30).isActive = true
        profileImageView.widthAnchor.constraint(equalToConstant: 150).isActive = true
        profileImageView.heightAnchor.constraint(equalToConstant: 150).isActive = true
    }
    
    func setupInputsContainerView() {
        //need x, y, width, height constraints
        inputsContainerView.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        inputsContainerView.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        inputsContainerView.widthAnchor.constraint(equalTo: view.widthAnchor, constant: -150).isActive = true
        inputsContainerView.heightAnchor.constraint(equalToConstant: 80).isActive = true
        
        inputsContainerView.addSubview(userTextField)
        
        //need x, y, width, height constraints
        userTextField.leftAnchor.constraint(equalTo: inputsContainerView.leftAnchor, constant: 50).isActive = true
        userTextField.topAnchor.constraint(equalTo: inputsContainerView.topAnchor).isActive = true
        
        userTextField.widthAnchor.constraint(equalTo: inputsContainerView.widthAnchor).isActive = true
        userTextField.heightAnchor.constraint(equalToConstant: 40).isActive = true
        
    }
    
    
    override var preferredStatusBarStyle : UIStatusBarStyle {
        return .lightContent
    }
}
