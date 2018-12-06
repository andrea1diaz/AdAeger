//
//  HomeDetailViewController.swift
//  Ad Aeger
//
//  Created by Andrea Diaz ♡ on 11/19/18.
//  Copyright © 2018 Andrea Diaz ♡. All rights reserved.
//

import Foundation
import UIKit

class HomeDetailViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {
    
    @IBOutlet weak var cvOptions: UICollectionView!
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 0
    }
    
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let id = "Option"
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: id, for: indexPath) as! HomeDetailCollectionViewCell
        
        cell.bckOption.image = UIImage.init(named: bck!)
        cell.iconOption.image = UIImage.init(named: icon!)
        
        return cell
    }
}
