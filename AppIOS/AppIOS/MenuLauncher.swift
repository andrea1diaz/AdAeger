//
//  MainMenuLauncher.swift
//  Ad Aeger
//


import Foundation
import UIKit

class Menu: NSObject {
    let name: String
    let imageName: String
    
    init(name: String, imageName: String) {
        self.name = name
        self.imageName = imageName
    }
}

class MainLauncher: NSObject, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    var homeController: HomeController?
    
    let blackView = UIView()
    
    let collectionView: UICollectionView = {
        let layout = UICollectionViewFlowLayout()
        let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
        cv.backgroundColor = UIColor.white
        return cv
    }()
    
    let cellId = "cellId"
    let cellHeight: CGFloat = 50
    
    let menus: [Menu] = {
        return [Menu(name: "H O M E", imageName:"none"), Menu(name: "L A B O R A T O R I E S", imageName: "none"), Menu(name: "C A L E N D A R", imageName: "none"), Menu(name: "P R O F I L E", imageName: "none"), Menu(name:"S E T T I N G S", imageName: "none"), Menu(name: "L O G  O U T", imageName: "none")]
    }()
    
    func showMenu() {
        //show menu
        
        if let window = UIApplication.shared.keyWindow {
            
            blackView.backgroundColor = UIColor(white: 0, alpha: 0.5)
            
            blackView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(handleDismiss)))
            
            window.addSubview(blackView)
            
            window.addSubview(collectionView)
            
            collectionView.frame = CGRect(x: (window.frame.height - window.frame.height - window.frame.height), y: 0, width: window.frame.width, height: window.frame.height)
            
            blackView.frame = window.frame
            blackView.alpha = 0
            
            UIView.animate(withDuration: 0.5, delay: 0, usingSpringWithDamping: 1, initialSpringVelocity: 1, options: .curveEaseOut, animations: {
                
                self.blackView.alpha = 1
                
                self.collectionView.frame = CGRect(x: 0, y: 0, width: (self.collectionView.frame.width - 150), height: self.collectionView.frame.height)
                
            }, completion: nil)
        }
    }
    
    @objc func handleDismiss(menu: Menu) {
        UIView.animate(withDuration: 0.5, animations: {
            self.blackView.alpha = 0
            
            if let window = UIApplication.shared.keyWindow {
                self.collectionView.frame = CGRect(x: (window.frame.height - window.frame.height - window.frame.height), y: 0, width: self.collectionView.frame.width, height: self.collectionView.frame.height)
            }
        }, completion: { (_) in
            if menu.name != "L A B O R A T O R I E S" && menu.name != "C A L E N D A R" && menu.name != "L O G  O U T" && menu.name != "P R O F I L E" && menu.name != "H O M E" && menu.name != "S E T T I N G S" {
                self.homeController?.showControllerForMenu(menu: menu)
            }
            
            if menu.name == "L A B O R A T O R I E S" {
                self.homeController?.handleConstruction()
            }
            
            if menu.name == "C A L E N D A R" {
                self.homeController?.handleConstruction()
            }
            
            if menu.name == "L O G  O U T" {
                self.homeController?.handleLogin()
            }
            
            if menu.name == "P R O F I L E" {
                self.homeController?.handleConstruction()
            }
            
            if menu.name == "S E T T I N G S" {
                self.homeController?.handleConstruction()
            }
        })
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        
        let menu = self.menus[indexPath.item]
        handleDismiss(menu: menu)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return menus.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath) as! MenuCell
        
        let menu = menus[indexPath.item]
        cell.menu = menu
        
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.frame.width, height: cellHeight)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        return 0
    }
    
    override init() {
        super.init()
        
        collectionView.dataSource = self
        collectionView.delegate = self
        
        collectionView.register(MenuCell.self, forCellWithReuseIdentifier: cellId)
    }
}
