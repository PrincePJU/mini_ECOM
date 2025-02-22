const { haversineDistance } = require('../utils/routeOptimization');

class TravelingSalesmanSolver {
    constructor(locations) {
        this.startPoint = {
            name: 'Start Point',
            latitude: 23.03965552350363,
            longitude: 72.59696188230406,
            delivery_address: 'Distribution Center'
        };

        this.locations = [this.startPoint, ...locations];
        this.distanceMatrix = this.createDistanceMatrix();
    }

    // Rest of the TravelingSalesmanSolver class methods remain unchanged
    createDistanceMatrix() {
        return this.locations.map((loc1, i) => 
            this.locations.map((loc2, j) => 
                i === j ? 0 : haversineDistance(
                    loc1.latitude, 
                    loc1.longitude, 
                    loc2.latitude, 
                    loc2.longitude
                )
            )
        );
    }

    solveNearestNeighbor() {
        const n = this.locations.length;
        const unvisited = new Set(Array.from({ length: n }, (_, i) => i));
        const route = [];
        let currentCity = 0;
        let totalDistance = 0;

        route.push(currentCity);
        unvisited.delete(currentCity);

        while (unvisited.size > 0) {
            let nearestCity = null;
            let minDistance = Infinity;

            for (let city of unvisited) {
                const distance = this.distanceMatrix[currentCity][city];
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestCity = city;
                }
            }

            if (nearestCity !== null) {
                route.push(nearestCity);
                totalDistance += minDistance;
                currentCity = nearestCity;
                unvisited.delete(nearestCity);
            }
        }

        totalDistance += this.distanceMatrix[currentCity][0];
        route.push(0);

        return {
            route: route.map(index => this.locations[index]),
            totalDistance: totalDistance
        };
    }

    improve2Opt(route) {
        let improved = true;
        let bestDistance = this.calculateRouteDistance(route);

        while (improved) {
            improved = false;
            for (let i = 1; i < route.length - 2; i++) {
                for (let j = i + 1; j < route.length - 1; j++) {
                    const newRoute = this.twoOptSwap(route, i, j);
                    const newDistance = this.calculateRouteDistance(newRoute);

                    if (newDistance < bestDistance) {
                        route = newRoute;
                        bestDistance = newDistance;
                        improved = true;
                        break;
                    }
                }
                if (improved) break;
            }
        }

        return { route, distance: bestDistance };
    }

    calculateRouteDistance(route) {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const loc1 = route[i];
            const loc2 = route[i + 1];
            totalDistance += haversineDistance(
                loc1.latitude, 
                loc1.longitude, 
                loc2.latitude, 
                loc2.longitude
            );
        }
        return totalDistance;
    }

    twoOptSwap(route, i, j) {
        return [
            ...route.slice(0, i),
            ...route.slice(i, j + 1).reverse(),
            ...route.slice(j + 1)
        ];
    }

    solve() {
        const initialSolution = this.solveNearestNeighbor();
        return this.improve2Opt(initialSolution.route);
    }
}

const processNearbyUsers = (req, res) => {
    try {
        const locations = req.body.locations;

        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({ error: 'Invalid locations array.' });
        }

        // Validate that each location has required fields
        const isValidLocation = locations.every(loc => 
            loc.latitude && 
            loc.longitude && 
            loc.delivery_address
        );

        if (!isValidLocation) {
            return res.status(400).json({ 
                error: 'Each location must have latitude, longitude, and delivery_address.' 
            });
        }

        const solver = new TravelingSalesmanSolver(locations);
        const solution = solver.solve();

        res.json({
            optimalRoute: solution.route.map(loc => ({
                name: loc.name || loc.email || 'Unnamed Location',
                delivery_address: loc.delivery_address
            })),
            totalDistance: solution.distance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { processNearbyUsers };