//
//  OptionCell.swift
//  Ad Aeger
//


import Foundation
import UIKit


class OptCell: UICollectionViewCell, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    var homeDetailController: HomeDetailController?

    
    private let cellId = "optCellId"
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    let hoverImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.image = UIImage(named: "hover1")
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        return imageView
    }()
    
    let iconImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.image = UIImage(named: "pill_bottle")
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        return imageView
    }()
    
    let listCollectionView: UICollectionView = {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .vertical
        let collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView.backgroundColor = UIColor.white
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        return collectionView
    }()

    
    func setupViews() {
        addSubview(hoverImageView)
        addSubview(iconImageView)
        addSubview(listCollectionView)
        
        addConstraintsWithFormat("H:|-7-[v0(400)]-7-|", views: hoverImageView)
        addConstraintsWithFormat("V:|-7-[v0(250)]-0-|", views: hoverImageView)
        
        addConstraintsWithFormat("H:|-158.5-[v0(97)]-158.5-|", views: iconImageView)
        addConstraintsWithFormat("V:|-40-[v0(132)]-12-|", views: iconImageView)
        
        
        listCollectionView.dataSource = self
        listCollectionView.delegate = self
        listCollectionView.register(ListCell.self, forCellWithReuseIdentifier: cellId)

        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .top, relatedBy: .equal, toItem: hoverImageView, attribute: .bottom, multiplier: 1, constant: 0))
        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .left, relatedBy: .equal, toItem: self, attribute: .left, multiplier: 1, constant: 7))
        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .right, relatedBy: .equal, toItem: self, attribute: .right , multiplier: 1, constant: 7))
        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .bottom, relatedBy: .equal, toItem: self, attribute: .bottom , multiplier: 1, constant: 7))
        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .height, relatedBy: .equal, toItem: self, attribute: .height, multiplier: 0, constant: frame.height - 257))
        addConstraint(NSLayoutConstraint(item: listCollectionView, attribute: .width, relatedBy: .equal, toItem: self, attribute: .width, multiplier: 0, constant: frame.width - 14))
        
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 5
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath) as! ListCell
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: frame.width, height: 50)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        return UIEdgeInsets(top: 0, left: 14, bottom: 0, right: 14)
    }
}

