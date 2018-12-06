//
//  HomeCell.swift
//  Ad Aeger
//

import UIKit

class BaseCell: UICollectionViewCell, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    func setupViews() {
        
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    
}

class HomeCell: BaseCell {
    
    let backgroundImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.image = UIImage(named: "rct1")
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        return imageView
    }()
    
    let iconImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.image = UIImage(named: "pill_bottle")
        imageView.contentMode = .scaleAspectFill
        imageView.layer.masksToBounds = true
        return imageView
    }()
    
    
    let titleLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "M E D I C I N E S"
        label.font = UIFont.systemFont(ofSize: 14)
        return label
    }()
    
    
    override func setupViews() {
        addSubview(backgroundImageView)
        addSubview(iconImageView)
        addSubview(titleLabel)
        
        
        addConstraintsWithFormat("H:|-0-[v0(202)]-0-|", views: backgroundImageView)
        addConstraintsWithFormat("V:|-0-[v0(220)]-0-|", views: backgroundImageView)
        
        addConstraintsWithFormat("H:|-52-[v0(97)]-52-|", views: iconImageView)
        addConstraintsWithFormat("V:|-29-[v0(132)]-12-|", views: iconImageView)
        
        
        //top constraint
        addConstraint(NSLayoutConstraint(item: titleLabel, attribute: .top, relatedBy: .equal, toItem: iconImageView, attribute: .bottom, multiplier: 1, constant: 12))

        //left constraint
        addConstraint(NSLayoutConstraint(item: titleLabel, attribute: .centerX, relatedBy: .equal, toItem: backgroundImageView, attribute: .centerX, multiplier: 1, constant: 0))

        //height constraint
        addConstraint(NSLayoutConstraint(item: titleLabel, attribute: .height, relatedBy: .equal, toItem: self, attribute: .height, multiplier: 0, constant: 20))
    
    }
    
}
