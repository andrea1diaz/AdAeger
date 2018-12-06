//
//  HomeController.swift
//  Ad Aeger
//
//  Created by Andrea Diaz ♡ on 11/18/18.
//  Copyright © 2018 Andrea Diaz ♡. All rights reserved.
//

import Foundation
import UIKit

class HomeController: UIViewController, UICollectionViewDelegateFlowLayout {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        navigationItem.title = "Home"
        navigationController?.navigationBar.isTranslucent = false
        
        let titleLabel = UILabel(frame: CGRect(x: 0, y: 0, width: view.frame.width - 32, height: view.frame.height))
        titleLabel.text = "Home"
        titleLabel.textColor = .white
        titleLabel.font = UIFont.systemFont(ofSize: 20)
        navigationItem.titleView = titleLabel
        
        collectionView?.backgroundColor = .white
        
        collectionView?.register(VideoCell.self, forCellWithReuseIdentifier: "cellId")
        
        collectionView?.contentInset = UIEdgeInsets(top: 50, left: 0, bottom: 0, right: 0)
        collectionView?.scrollIndicatorInsets = UIEdgeInsets(top: 50, left: 0, bottom: 0, right: 0)
        
        setupMenuBar()
    }
    
    let menuBar: MenuBar = {
        let mb = MenuBar()
        return mb
    }()
    
    private func setupMenuBar() {
        view.addSubview(menuBar)
        view.addConstraintsWithFormat("H:|[v0]|", views: menuBar)
        view.addConstraintsWithFormat("V:|[v0(50)]", views: menuBar)
    }
    
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 5
    }
    
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "cellId", for: indexPath)
        
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let height = (view.frame.width - 16 - 16) * 9 / 16
        return CGSize(width: view.frame.width, height: height + 16 + 68)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        return 0
    }
//    @IBOutlet var sqrsHome: UICollectionView!
//
//
//    let titles = ["M E D I C A T I O N S", "L A S T   S Y M P T O M S", "A P P O I NT M E N T", "R E M I N D E R" ]
//    let backgrounds = ["rct1", "rct2", "rct3", "rct4"]
//    let icons = ["pill_bottle", "icon2", "icon3", "icon4"]
//
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//    }
//
//    override func viewWillAppear(_ animated: Bool) {
//        super.viewWillAppear(true)
//        self.navigationController?.setNavigationBarHidden(true, animated: true)
//    }
//
//    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        print("here!!")
//        return titles.count
//    }
//
//    func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
//        switch kind {
//            case UICollectionView.elementKindSectionHeader:
//                let id = "MenuBar"
//                let headerView = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: id, for: indexPath) as! Header
//
//                headerView.txtHeader.text = "M E N U"
//                headerView.iconHeader.image = UIImage.init(imageLiteralResourceName: "iconMenu")
//
//                return headerView
//        default:
//            assert(false, "Unexpected element kind")
//        }
//    }
//
//
//    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//
//        let id = "Medications"
//        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: id, for: indexPath) as! HomeCollectionViewCell
//
//        cell.rct1.image = UIImage.init(imageLiteralResourceName: backgrounds[indexPath.row])
//        cell.iconMed.image = UIImage.init(imageLiteralResourceName: icons[indexPath.row])
//        cell.titleMed.text = titles[indexPath.row]
//
//        return cell
//    }
//
}
