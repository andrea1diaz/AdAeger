//
//  ViewController.swift
//

import UIKit

class HomeController: UICollectionViewController, UICollectionViewDelegateFlowLayout {
    
    let titles = ["M E D I C A T I O N S", "L A S T   S Y M P T O M S", "A P P O I N T M E N T", "R E M I N D E R", "I N  P R O G R E S S", "I N  P R O G R E S S" ]
    let backgrounds = ["rct1", "rct2", "rct3", "rct4", "rct5", "rct5"]
    let icons = ["pill_bottle", "icon2", "icon3", "icon4", "icon5", "icon6"]

    override func viewDidLoad() {
        super.viewDidLoad()
        
        navigationItem.title = "H O M E"
        navigationController?.navigationBar.isTranslucent = false
        
        let titleLabel = UILabel(frame: CGRect(x: 0, y: 0, width: view.frame.width - 22, height: view.frame.height))
        titleLabel.text = "H O M E"
        titleLabel.textColor = .black
        titleLabel.font = UIFont.boldSystemFont(ofSize: 16)
        titleLabel.textAlignment = .center
        navigationItem.titleView = titleLabel
        
        collectionView?.backgroundColor = .white
        
        collectionView?.register(HomeCell.self, forCellWithReuseIdentifier: "cellId")
        
        
        collectionView?.contentInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
        collectionView?.scrollIndicatorInsets = UIEdgeInsets(top: 50, left: 0, bottom: 0, right: 0)
        
        setupNavBarButtons()
        APIClient.medicationsFetch()
    }
    
    func setupNavBarButtons() {
        let moreButton = UIBarButtonItem(image: UIImage(named: "iconMenu")?.withRenderingMode(.alwaysOriginal), style: .plain, target: self, action: #selector(handleMore))
        navigationItem.leftBarButtonItems = [moreButton]
    }
    
    
    lazy var menuLauncher: MainLauncher = {
        let menu = MainLauncher()
        menu.homeController = self
        return menu
    } ()
    
    func showControllerForMenu(menu: Menu) {
    
        let dummyMenusViewController = UIViewController()
        dummyMenusViewController.view.backgroundColor = UIColor.black
        dummyMenusViewController.navigationItem.title = menu.name
        
        navigationController?.navigationBar.tintColor = UIColor.black
        navigationController?.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor: UIColor.black]
        navigationController?.pushViewController(dummyMenusViewController, animated: true)
    }
    
    
    @objc func handleMore() {
        menuLauncher.showMenu()
    }
    
    @objc func handleLogin() {
        let loginController = LoginController()
        present(loginController, animated: true, completion: nil)
    }
    
    @objc func handleConstruction() {
        let controller = ConstructionController()
        
        navigationController?.navigationBar.tintColor = UIColor.black
        navigationController?.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor: UIColor.black]
        
        navigationController?.pushViewController(controller, animated: true)
    }
    
    
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 6
    }
    
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "cellId", for: indexPath) as! HomeCell
        cell.backgroundImageView.image = UIImage.init(named: backgrounds[indexPath.row])
            cell.iconImageView.image = UIImage.init(named: icons[indexPath.row])
            cell.titleLabel.text = titles[indexPath.row]
        return cell
    }
    
    
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: 202, height: 220)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        return 0
    }
    
    override func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if titles[indexPath.row] == "M E D I C A T I O N S" {
            handleDetail()
        }
    }
    
    func handleDetail() {
        let controller = HomeDetailController(collectionViewLayout: UICollectionViewFlowLayout())
        
        navigationController?.navigationBar.tintColor = UIColor.black
        navigationController?.navigationBar.titleTextAttributes = [NSAttributedString.Key.foregroundColor: UIColor.black]
        navigationController?.pushViewController(controller, animated: true)
    }
}






