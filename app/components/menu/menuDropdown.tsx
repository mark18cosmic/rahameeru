import { Accordion, AccordionItem, Card } from "@nextui-org/react";

interface Dish {
    name: string;
    description: string;
    price: number;
    image: string;
}

interface Menu {
    category: string;
    dishes: Dish[];
}

interface MenuProps {
    menuItems: Menu[];
}

const MenuDropdown: React.FC<MenuProps> = ({ menuItems }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            {menuItems.map((menu, idx) => (
                <Accordion key={idx} className="w-full">
                    <AccordionItem
                        title={
                            <h4 className="text-xl font-semibold text-gray-900">
                                {menu.category}
                            </h4>}
                        className="p-4 gap-2 shadow-md rounded-md mb-4"
                    >
                        {menu.dishes.map((dish, dishIdx) => (
                            <Card
                            key={dishIdx}
                            className="flex mb-2 items-center gap-4 p-4 flex-row rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                        >
                            <div className="w-24 h-24 flex-shrink-0">
                                <img
                                    src={dish.image}
                                    alt={dish.name}
                                    className="w-full h-full object-cover rounded-md"
                                />
                            </div>
                            <div className="flex flex-col flex-grow">
                                <h4 className="text-xl font-semibold text-gray-800">{dish.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{dish.description}</p>
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                                ރ{dish.price}
                            </div>
                        </Card>
                        ))}
                    </AccordionItem>
                </Accordion>
            ))}
        </div>
    );
};

export default MenuDropdown;
