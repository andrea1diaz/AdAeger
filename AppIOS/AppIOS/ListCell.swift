//
//  ListCell.swift
//  Ad Aeger
//


import Foundation
import UIKit

class ListCell: UICollectionViewCell {
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    let itemLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "Keppra"
        label.font = UIFont.systemFont(ofSize: 20)
        return label
    }()
    
    let numberLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "90"
        label.font = UIFont.boldSystemFont(ofSize: 30)
        return label
    }()
    
    let takeButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("TAKE IT", for: .normal)
        button.layer.borderColor = UIColor(red: 0, green: 129/255, blue: 250/255, alpha: 1).cgColor
        button.layer.borderWidth = 1
        button.layer.cornerRadius = 5
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 14)
        return button
    }()
    
    let dividerLineView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(white: 0.4, alpha: 0.4)
        return view
    }()
    
    func setupViews() {
        addSubview(itemLabel)
        addSubview(numberLabel)
        addSubview(takeButton)
        addSubview(dividerLineView)

        itemLabel.frame = CGRect(x:61, y: 0, width: frame.width - 175, height: 40)
        numberLabel.frame = CGRect(x:14, y: 0, width: 40, height: 40)
        takeButton.frame = CGRect(x: Int(frame.width - 107), y: 0, width: 90, height: 35)
        dividerLineView.frame = CGRect(x: 61, y: 42, width: frame.width - 175, height: 2)

    }
}
